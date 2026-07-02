import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card, Outcome } from '../../core/models/card.model';
import { BlackjackPayout, Settings } from '../../core/models/game.model';
import {
  Shoe, handValue, isBlackjack, isRed, rankValue, recommend, actionLabel,
} from '../../core/engine';
import { StatsService } from '../../core/services/stats.service';
import { ProgressionService } from '../../core/services/progression.service';
import { SettingsService } from '../../core/services/settings.service';
import { SoundService } from '../../core/services/sound.service';

type Phase = 'bet' | 'insurance' | 'player' | 'dealer' | 'done';

/** Une main du joueur (il peut y en avoir plusieurs après séparation). */
interface Hand {
  cards: Card[];
  bet: number;
  doubled: boolean;
  surrendered: boolean;
  fromSplit: boolean;
  done: boolean;
  outcome?: Outcome;
  payout?: number;
}

@Component({
  selector: 'app-classique',
  imports: [RouterLink],
  templateUrl: './classique.html',
  styleUrl: './classique.scss',
})
export class Classique implements OnDestroy {
  private readonly stats = inject(StatsService);
  private readonly progression = inject(ProgressionService);
  private readonly settingsSvc = inject(SettingsService);
  private readonly sound = inject(SoundService);

  private shoe = new Shoe(this.settingsSvc.settings().decks);
  private shoeDecks = this.settingsSvc.settings().decks;
  private dealerTimer?: ReturnType<typeof setTimeout>;
  private confettiTimer?: ReturnType<typeof setTimeout>;

  /** Bankroll unifiée : une seule source de vérité, partagée avec le lobby. */
  protected readonly bankroll = this.progression.bankroll;
  protected readonly cfg = this.settingsSvc.settings;

  protected readonly pendingBet = signal(0);
  protected readonly hands = signal<Hand[]>([]);
  protected readonly activeIndex = signal(0);
  protected readonly dealer = signal<Card[]>([]);
  protected readonly phase = signal<Phase>('bet');
  protected readonly revealed = signal(false);
  protected readonly insuranceBet = signal(0);
  protected readonly message = signal('Placez votre mise.');
  protected readonly showSettings = signal(false);
  protected readonly confetti = signal(false);
  protected readonly chips = [5, 25, 100, 500];
  protected readonly speeds: Settings['speed'][] = ['slow', 'normal', 'fast'];
  protected readonly payouts: BlackjackPayout[] = ['3:2', '6:5'];
  protected readonly deckOptions = [1, 2, 4, 6, 8];
  protected readonly splitOptions = [1, 2, 3];

  protected readonly confettiPieces = Array.from({ length: 26 }, (_, i) => ({
    left: (i * 37 + 13) % 100,
    delay: (i % 10) * 55,
    dur: 950 + (i % 6) * 170,
    emoji: ['🎉', '✨', '💛', '🃏', '💎', '🎊'][i % 6],
  }));

  protected readonly activeHand = computed<Hand | undefined>(() => this.hands()[this.activeIndex()]);
  protected readonly dealerValue = computed(() => handValue(this.dealer()).total);

  protected handTotal(h: Hand): number { return handValue(h.cards).total; }
  protected isSoft(h: Hand): boolean { return handValue(h.cards).soft; }
  protected red(c: Card): boolean { return isRed(c.suit); }

  protected readonly insuranceCost = computed(() => Math.floor((this.hands()[0]?.bet ?? 0) / 2));

  protected readonly canDouble = computed(() => {
    const h = this.activeHand();
    if (this.phase() !== 'player' || !h || h.cards.length !== 2) return false;
    if (this.bankroll() < h.bet) return false;
    if (h.fromSplit && !this.cfg().doubleAfterSplit) return false;
    return true;
  });

  protected readonly canSplit = computed(() => {
    const h = this.activeHand();
    if (this.phase() !== 'player' || !h || h.cards.length !== 2) return false;
    if (rankValue(h.cards[0].rank) !== rankValue(h.cards[1].rank)) return false;
    if (this.bankroll() < h.bet) return false;
    if (this.hands().length >= this.cfg().maxSplits + 1) return false;
    return true;
  });

  protected readonly canSurrender = computed(() => {
    const h = this.activeHand();
    if (this.phase() !== 'player' || !this.cfg().surrender) return false;
    if (this.hands().length !== 1 || !h || h.cards.length !== 2 || h.fromSplit) return false;
    return true;
  });

  /** Conseil de stratégie de base pour la main active. */
  protected readonly hint = computed(() => {
    const h = this.activeHand();
    if (this.phase() !== 'player' || !h || this.dealer().length < 2) return '';
    const advice = recommend(h.cards, this.dealer()[1], this.canDouble(), this.canSplit());
    return actionLabel(advice.code, this.canDouble());
  });

  // ---- Phase des mises -------------------------------------------------

  protected addBet(v: number): void {
    if (this.phase() !== 'bet' || this.pendingBet() + v > this.bankroll()) return;
    this.pendingBet.update((b) => b + v);
    this.sound.chip();
  }
  protected clearBet(): void { this.pendingBet.set(0); }

  protected deal(): void {
    const bet = this.pendingBet();
    if (this.phase() !== 'bet' || bet <= 0 || bet > this.bankroll()) return;
    this.ensureShoe();
    this.progression.setBankroll(this.bankroll() - bet);
    this.sound.chip();

    this.hands.set([{
      cards: [this.shoe.draw(), this.shoe.draw()],
      bet, doubled: false, surrendered: false, fromSplit: false, done: false,
    }]);
    this.dealer.set([this.shoe.draw(), this.shoe.draw()]);
    this.activeIndex.set(0);
    this.insuranceBet.set(0);
    this.revealed.set(false);
    this.sound.card();

    const up = this.dealer()[1];
    if (up.rank === 'A' && this.bankroll() >= this.insuranceCost()) {
      this.phase.set('insurance');
      this.message.set('Le croupier montre un As. Assurance ?');
      return;
    }
    this.afterBetResolved();
  }

  // ---- Assurance -------------------------------------------------------

  protected takeInsurance(): void {
    if (this.phase() !== 'insurance') return;
    const cost = this.insuranceCost();
    this.progression.setBankroll(this.bankroll() - cost);
    this.insuranceBet.set(cost);
    this.sound.chip();
    this.afterBetResolved();
  }
  protected declineInsurance(): void {
    if (this.phase() !== 'insurance') return;
    this.afterBetResolved();
  }

  /** Le croupier « jette un œil » sur un As/10 ; règle les naturels. */
  private afterBetResolved(): void {
    const up = this.dealer()[1];
    const canPeek = up.rank === 'A' || rankValue(up.rank) === 10;
    const dealerBJ = canPeek && isBlackjack(this.dealer());

    if (this.insuranceBet() > 0 && dealerBJ) {
      this.progression.setBankroll(this.bankroll() + this.insuranceBet() * 3);
    }
    if (dealerBJ) { this.settle(); return; }
    if (isBlackjack(this.hands()[0].cards)) {
      this.patchHand(0, { done: true });
      this.settle();
      return;
    }
    this.phase.set('player');
    this.message.set('À vous de jouer.');
  }

  // ---- Actions du joueur ----------------------------------------------

  protected hit(): void {
    if (this.phase() !== 'player') return;
    const i = this.activeIndex();
    this.addCard(i, this.shoe.draw());
    if (this.handTotal(this.hands()[i]) >= 21) { this.patchHand(i, { done: true }); this.advance(); }
  }

  protected stand(): void {
    if (this.phase() !== 'player') return;
    this.sound.click();
    this.patchHand(this.activeIndex(), { done: true });
    this.advance();
  }

  protected double(): void {
    if (!this.canDouble()) return;
    const i = this.activeIndex();
    const h = this.hands()[i];
    this.progression.setBankroll(this.bankroll() - h.bet);
    this.sound.chip();
    const card = this.shoe.draw();
    this.sound.card();
    this.hands.update((hs) => hs.map((hh, idx) =>
      idx === i ? { ...hh, bet: hh.bet * 2, doubled: true, cards: [...hh.cards, card], done: true } : hh,
    ));
    this.advance();
  }

  protected split(): void {
    if (!this.canSplit()) return;
    const i = this.activeIndex();
    const h = this.hands()[i];
    this.progression.setBankroll(this.bankroll() - h.bet);
    this.sound.chip();
    const aces = rankValue(h.cards[0].rank) === 11;
    const handA: Hand = { ...h, cards: [h.cards[0], this.shoe.draw()], fromSplit: true, doubled: false, done: aces };
    const handB: Hand = {
      cards: [h.cards[1], this.shoe.draw()], bet: h.bet,
      doubled: false, surrendered: false, fromSplit: true, done: aces,
    };
    this.sound.card();
    this.hands.update((hs) => { const copy = [...hs]; copy.splice(i, 1, handA, handB); return copy; });
    if (aces || this.handTotal(handA) >= 21) { this.patchHand(i, { done: true }); this.advance(); }
  }

  protected surrender(): void {
    if (!this.canSurrender()) return;
    this.sound.lose();
    this.patchHand(this.activeIndex(), { surrendered: true, done: true });
    this.advance();
  }

  // ---- Tour du croupier & règlement -----------------------------------

  private advance(): void {
    const hs = this.hands();
    const next = hs.findIndex((h, idx) => idx > this.activeIndex() && !h.done);
    if (next !== -1) {
      this.activeIndex.set(next);
      if (this.handTotal(hs[next]) >= 21) { this.patchHand(next, { done: true }); this.advance(); }
      return;
    }
    const anyLive = this.hands().some((h) => !h.surrendered && this.handTotal(h) <= 21);
    if (anyLive) this.dealerPlay(); else this.settle();
  }

  private dealerPlay(): void {
    this.phase.set('dealer');
    this.revealed.set(true);
    this.sound.card();
    const step = (): void => {
      const d = this.dealer();
      const v = handValue(d);
      const mustHit = v.total < 17 || (v.total === 17 && v.soft && this.cfg().dealerHitsSoft17);
      if (mustHit) {
        this.dealer.set([...d, this.shoe.draw()]);
        this.sound.card();
        this.dealerTimer = setTimeout(step, this.settingsSvc.dealMs());
      } else {
        this.settle();
      }
    };
    this.dealerTimer = setTimeout(step, this.settingsSvc.dealMs());
  }

  private settle(): void {
    this.revealed.set(true);
    const dealerBJ = isBlackjack(this.dealer());
    const dv = handValue(this.dealer()).total;
    let net = 0;
    let win = false, bj = false, loss = false;

    const settled = this.hands().map((h) => {
      const pv = this.handTotal(h);
      const pBJ = !h.fromSplit && h.cards.length === 2 && pv === 21;
      let outcome: Outcome;
      let payout = 0;
      if (h.surrendered) { outcome = 'loss'; payout = h.bet / 2; }
      else if (pv > 21) { outcome = 'loss'; }
      else if (pBJ && dealerBJ) { outcome = 'push'; payout = h.bet; }
      else if (pBJ) { outcome = 'bj'; payout = h.bet + h.bet * this.settingsSvc.bjMultiplier(); }
      else if (dealerBJ) { outcome = 'loss'; }
      else if (dv > 21 || pv > dv) { outcome = 'win'; payout = h.bet * 2; }
      else if (pv < dv) { outcome = 'loss'; }
      else { outcome = 'push'; payout = h.bet; }

      net += payout - h.bet;
      this.stats.recordHand(outcome, h.bet);
      this.stats.recordNet(payout - h.bet);
      this.progression.addXp(outcome === 'bj' ? 15 : outcome === 'win' ? 10 : outcome === 'push' ? 3 : 5);
      if (outcome === 'bj') bj = true;
      else if (outcome === 'win') win = true;
      else if (outcome === 'loss' && !h.surrendered) loss = true;
      return { ...h, outcome, payout, done: true };
    });

    const totalPayout = settled.reduce((s, h) => s + (h.payout ?? 0), 0);
    this.progression.setBankroll(this.bankroll() + totalPayout);
    this.hands.set(settled);
    this.phase.set('done');
    this.message.set(this.summary(net));

    if (bj) { this.sound.blackjack(); this.celebrate(); }
    else if (win) { this.sound.win(); this.celebrate(); }
    else if (loss) this.sound.lose();
    else this.sound.push();
  }

  protected newRound(): void {
    this.clearTimers();
    this.hands.set([]);
    this.dealer.set([]);
    this.activeIndex.set(0);
    this.insuranceBet.set(0);
    this.revealed.set(false);
    this.confetti.set(false);
    if (this.pendingBet() > this.bankroll()) this.pendingBet.set(0);
    this.phase.set('bet');
    this.message.set(this.bankroll() <= 0 ? 'Plus de jetons ! Réinitialisez.' : 'Placez votre mise.');
  }

  protected reset(): void {
    this.progression.setBankroll(1000);
    this.pendingBet.set(0);
    this.newRound();
  }

  // ---- Réglages --------------------------------------------------------

  protected toggleSettings(): void { this.showSettings.update((v) => !v); }
  protected updateCfg(patch: Partial<Settings>): void {
    this.settingsSvc.update(patch);
    this.sound.click();
  }

  ngOnDestroy(): void { this.clearTimers(); }

  // ---- Interne ---------------------------------------------------------

  private ensureShoe(): void {
    const d = this.cfg().decks;
    if (d !== this.shoeDecks) { this.shoe = new Shoe(d); this.shoeDecks = d; }
  }
  private addCard(i: number, card: Card): void {
    this.sound.card();
    this.hands.update((hs) => hs.map((h, idx) => (idx === i ? { ...h, cards: [...h.cards, card] } : h)));
  }
  private patchHand(i: number, patch: Partial<Hand>): void {
    this.hands.update((hs) => hs.map((h, idx) => (idx === i ? { ...h, ...patch } : h)));
  }
  private celebrate(): void {
    if (!this.cfg().confetti) return;
    this.confetti.set(true);
    this.confettiTimer = setTimeout(() => this.confetti.set(false), 1500);
  }
  private clearTimers(): void {
    clearTimeout(this.dealerTimer);
    clearTimeout(this.confettiTimer);
  }
  private summary(net: number): string {
    if (net > 0) return `Gagné ! +${net} jetons 🎉`;
    if (net < 0) return `Perdu… ${net} jetons`;
    return 'Égalité, mises rendues.';
  }
}
