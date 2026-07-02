import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Card } from '../../../core/models/card.model';
import { Settings } from '../../../core/models/game.model';
import {
  actionLabel,
  dealerShouldHit,
  handValue,
  isBlackjack,
  rankValue,
  recommend,
  settleHand,
  Shoe,
} from '../../../core/engine';
import { ProgressionService } from '../../../core/services/progression.service';
import { SettingsService } from '../../../core/services/settings.service';
import { SoundService } from '../../../core/services/sound.service';
import { StatsService } from '../../../core/services/stats.service';
import { Hand, Phase } from '../models/hand.model';

/**
 * Machine à états du blackjack « Classique » : distribution, actions du joueur,
 * assurance, tour du croupier et règlement. Fournie au niveau de la page, son
 * `ngOnDestroy` nettoie les timers d'animation.
 * @export
 */
@Injectable()
export class ClassiqueGame implements OnDestroy {
  private readonly progression = inject(ProgressionService);
  private readonly settingsSvc = inject(SettingsService);
  private readonly sound = inject(SoundService);
  private readonly stats = inject(StatsService);
  private readonly messages = inject(MessageService);

  private shoe = new Shoe(this.settingsSvc.settings().decks);
  private shoeDecks = this.settingsSvc.settings().decks;
  private dealerTimer?: ReturnType<typeof setTimeout>;
  private confettiTimer?: ReturnType<typeof setTimeout>;
  private readonly insuranceBet = signal(0);

  // État exposé, lu par la page et les composants de présentation.
  readonly bankroll = this.progression.bankroll; // source de vérité partagée avec le lobby
  readonly settings = this.settingsSvc.settings;
  readonly pendingBet = signal(0);
  readonly hands = signal<Hand[]>([]);
  readonly activeIndex = signal(0);
  readonly dealer = signal<Card[]>([]);
  readonly phase = signal<Phase>('bet');
  readonly revealed = signal(false);
  readonly message = signal('Placez votre mise.');
  readonly confetti = signal(false);

  // Valeurs dérivées de l'état.
  readonly activeHand = computed(() => this.hands()[this.activeIndex()]);
  readonly dealerValue = computed(() => handValue(this.dealer()).total);
  readonly insuranceCost = computed(() => Math.floor((this.hands()[0]?.bet ?? 0) / 2));

  /** Double possible sur la main active. */
  readonly canDouble = computed(() => {
    const hand = this.activeHand();
    if (this.phase() !== 'player' || !hand || hand.cards.length !== 2) return false;
    return this.bankroll() >= hand.bet && (!hand.fromSplit || this.settings().doubleAfterSplit);
  });

  /** Séparation possible sur la main active. */
  readonly canSplit = computed(() => {
    const hand = this.activeHand();
    if (this.phase() !== 'player' || !hand || hand.cards.length !== 2) return false;
    if (rankValue(hand.cards[0].rank) !== rankValue(hand.cards[1].rank)) return false;
    return this.bankroll() >= hand.bet && this.hands().length < this.settings().maxSplits + 1;
  });

  /** Abandon possible sur la main active. */
  readonly canSurrender = computed(() => {
    const hand = this.activeHand();
    if (this.phase() !== 'player' || !this.settings().surrender || !hand) return false;
    return this.hands().length === 1 && hand.cards.length === 2 && !hand.fromSplit;
  });

  /** Conseil de stratégie de base pour la main active (vide hors jeu). */
  readonly hint = computed(() => {
    const hand = this.activeHand();
    if (this.phase() !== 'player' || !hand || this.dealer().length < 2) return '';
    const advice = recommend(hand.cards, this.dealer()[1], this.canDouble(), this.canSplit());
    return actionLabel(advice.code, this.canDouble());
  });

  /** Ajoute un jeton à la mise en cours. */
  addBet(value: number): void {
    if (this.phase() !== 'bet' || this.pendingBet() + value > this.bankroll()) return;
    this.pendingBet.update((bet) => bet + value);
    this.sound.chip();
  }

  /** Réinitialise la mise en cours. */
  clearBet(): void {
    this.pendingBet.set(0);
  }

  /** Distribue les cartes et engage la mise. */
  deal(): void {
    const bet = this.pendingBet();
    if (this.phase() !== 'bet' || bet <= 0 || bet > this.bankroll()) return;
    // Reconstruit le sabot si besoin, débite la mise, distribue.
    this.ensureShoe();
    this.progression.setBankroll(this.bankroll() - bet);
    this.hands.set([this.makeHand([this.shoe.draw(), this.shoe.draw()], bet)]);
    this.dealer.set([this.shoe.draw(), this.shoe.draw()]);
    this.activeIndex.set(0);
    this.insuranceBet.set(0);
    this.revealed.set(false);
    this.sound.chip();
    this.sound.card();

    // Croupier montrant un As : proposer l'assurance avant de continuer.
    const upcard = this.dealer()[1];
    if (upcard.rank === 'A' && this.bankroll() >= this.insuranceCost()) {
      this.phase.set('insurance');
      this.message.set('Le croupier montre un As. Assurance ?');
      return;
    }
    this.afterBetResolved();
  }

  /** Souscrit l'assurance (moitié de la mise). */
  takeInsurance(): void {
    if (this.phase() !== 'insurance') return;
    this.insuranceBet.set(this.insuranceCost());
    this.progression.setBankroll(this.bankroll() - this.insuranceBet());
    this.sound.chip();
    this.afterBetResolved();
  }

  /** Refuse l'assurance. */
  declineInsurance(): void {
    if (this.phase() === 'insurance') this.afterBetResolved();
  }

  /** Tire une carte sur la main active. */
  hit(): void {
    if (this.phase() !== 'player') return;
    const index = this.activeIndex();
    this.sound.card();
    this.patchHand(index, { cards: [...this.hands()[index].cards, this.shoe.draw()] });
    // Bust ou 21 : la main est close, on passe à la suivante.
    if (handValue(this.hands()[index].cards).total >= 21) this.close(index);
  }

  /** Reste sur la main active. */
  stand(): void {
    if (this.phase() !== 'player') return;
    this.sound.click();
    this.close(this.activeIndex());
  }

  /** Double la mise, tire une carte et clôt la main active. */
  double(): void {
    if (!this.canDouble()) return;
    const index = this.activeIndex();
    const hand = this.hands()[index];
    this.progression.setBankroll(this.bankroll() - hand.bet);
    this.sound.chip();
    this.sound.card();
    this.patchHand(index, {
      bet: hand.bet * 2,
      doubled: true,
      cards: [...hand.cards, this.shoe.draw()],
    });
    this.close(index);
  }

  /** Sépare une paire en deux mains. */
  split(): void {
    if (!this.canSplit()) return;
    const index = this.activeIndex();
    const hand = this.hands()[index];
    this.progression.setBankroll(this.bankroll() - hand.bet);
    this.sound.chip();
    this.sound.card();
    // Séparer des As : chaque main reçoit une seule carte et est close.
    const aces = rankValue(hand.cards[0].rank) === 11;
    const extra = { fromSplit: true, done: aces };
    const handA = this.makeHand([hand.cards[0], this.shoe.draw()], hand.bet, extra);
    const handB = this.makeHand([hand.cards[1], this.shoe.draw()], hand.bet, extra);
    this.hands.update((hands) => {
      const copy = [...hands];
      copy.splice(index, 1, handA, handB);
      return copy;
    });
    // Enchaîne si la première main est déjà close (As) ou fait 21.
    if (aces || handValue(handA.cards).total >= 21) this.close(index);
  }

  /** Abandonne la main active (moitié de la mise rendue). */
  surrender(): void {
    if (!this.canSurrender()) return;
    this.sound.lose();
    this.patchHand(this.activeIndex(), { surrendered: true });
    this.close(this.activeIndex());
  }

  /** Prépare une nouvelle manche en conservant la mise si elle reste jouable. */
  newRound(): void {
    this.clearTimers();
    this.hands.set([]);
    this.dealer.set([]);
    this.activeIndex.set(0);
    this.insuranceBet.set(0);
    this.revealed.set(false);
    this.confetti.set(false);
    if (this.pendingBet() > this.bankroll()) this.pendingBet.set(0);
    this.phase.set('bet');
    this.message.set(
      this.bankroll() <= 0 ? 'Plus de jetons ! Réinitialisez.' : 'Placez votre mise.',
    );
  }

  /** Recharge la bankroll et relance une manche vierge. */
  reset(): void {
    this.progression.setBankroll(1000);
    this.pendingBet.set(0);
    this.newRound();
  }

  /** Met à jour un ou plusieurs réglages. */
  updateSettings(patch: Partial<Settings>): void {
    this.settingsSvc.update(patch);
    this.sound.click();
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  /** Le croupier « jette un œil » sur un As/10 puis règle les blackjacks naturels. */
  private afterBetResolved(): void {
    const upcard = this.dealer()[1];
    const dealerBlackjack =
      (upcard.rank === 'A' || rankValue(upcard.rank) === 10) && isBlackjack(this.dealer());
    // Assurance gagnante : payée 2:1 (mise + 2× = 3×).
    if (this.insuranceBet() > 0 && dealerBlackjack) {
      this.progression.setBankroll(this.bankroll() + this.insuranceBet() * 3);
    }
    // Blackjack naturel (croupier ou joueur) : la manche est réglée aussitôt.
    if (dealerBlackjack || isBlackjack(this.hands()[0].cards)) {
      this.settle();
      return;
    }
    this.phase.set('player');
    this.message.set('À vous de jouer.');
  }

  /** Clôt une main puis passe à la suivante ou au croupier. */
  private close(index: number): void {
    this.patchHand(index, { done: true });
    // Cherche la prochaine main non terminée ; la saute si elle est déjà à 21+.
    const next = this.hands().findIndex((hand, idx) => idx > index && !hand.done);
    if (next !== -1) {
      this.activeIndex.set(next);
      if (handValue(this.hands()[next].cards).total >= 21) this.close(next);
      return;
    }
    // Toutes jouées : le croupier ne joue que s'il reste une main vivante.
    const anyLive = this.hands().some((h) => !h.surrendered && handValue(h.cards).total <= 21);
    if (anyLive) this.dealerPlay();
    else this.settle();
  }

  /** Fait jouer le croupier, une carte à la fois, avec animation temporisée. */
  private dealerPlay(): void {
    this.phase.set('dealer');
    this.revealed.set(true);
    this.sound.card();
    const step = (): void => {
      if (dealerShouldHit(this.dealer(), this.settings().dealerHitsSoft17)) {
        this.dealer.set([...this.dealer(), this.shoe.draw()]);
        this.sound.card();
        this.dealerTimer = setTimeout(step, this.settingsSvc.dealMs());
      } else {
        this.settle();
      }
    };
    this.dealerTimer = setTimeout(step, this.settingsSvc.dealMs());
  }

  /** Règle toutes les mains, crédite les gains et met à jour statistiques et XP. */
  private settle(): void {
    this.revealed.set(true);
    const bjMultiplier = this.settingsSvc.bjMultiplier();
    let net = 0;
    // Règle chaque main via la fonction pure, en cumulant net, stats et XP.
    const settled = this.hands().map((hand) => {
      const { outcome, payout } = settleHand({
        playerCards: hand.cards,
        dealerCards: this.dealer(),
        bet: hand.bet,
        fromSplit: hand.fromSplit,
        surrendered: hand.surrendered,
        bjMultiplier,
      });
      net += payout - hand.bet;
      this.stats.recordHand(outcome, hand.bet);
      this.stats.recordNet(payout - hand.bet);
      this.progression.addXp({ bj: 15, win: 10, push: 3, loss: 5 }[outcome]);
      return { ...hand, outcome, payout, done: true };
    });

    // Crédite la somme des gains et bascule en fin de manche.
    this.progression.setBankroll(this.bankroll() + settled.reduce((s, h) => s + h.payout, 0));
    this.hands.set(settled);
    this.phase.set('done');
    this.message.set(this.summary(net));
    this.feedback(settled);

    // Notification (toast) résumant le résultat de la manche.
    this.messages.add(
      net > 0
        ? { severity: 'success', summary: 'Manche gagnée', detail: `+${net} jetons` }
        : net < 0
          ? { severity: 'error', summary: 'Manche perdue', detail: `${net} jetons` }
          : { severity: 'info', summary: 'Égalité', detail: 'Mises rendues' },
    );
  }

  /** Retour sonore et confettis selon le meilleur résultat de la manche. */
  private feedback(hands: Hand[]): void {
    const outcomes = hands.map((h) => h.outcome);
    if (outcomes.includes('bj') || outcomes.includes('win')) {
      if (outcomes.includes('bj')) this.sound.blackjack();
      else this.sound.win();
      if (this.settings().confetti) {
        this.confetti.set(true);
        this.confettiTimer = setTimeout(() => this.confetti.set(false), 1500);
      }
    } else if (outcomes.some((o, i) => o === 'loss' && !hands[i].surrendered)) {
      this.sound.lose();
    } else {
      this.sound.push();
    }
  }

  /** Recrée le sabot si le nombre de jeux a changé dans les réglages. */
  private ensureShoe(): void {
    if (this.settings().decks !== this.shoeDecks) {
      this.shoeDecks = this.settings().decks;
      this.shoe = new Shoe(this.shoeDecks);
    }
  }

  /** Construit une main neuve (valeurs par défaut surchargeables via `extra`). */
  private makeHand(cards: Card[], bet: number, extra: Partial<Hand> = {}): Hand {
    return {
      cards,
      bet,
      doubled: false,
      surrendered: false,
      fromSplit: false,
      done: false,
      ...extra,
    };
  }

  /** Applique une modification partielle à une main. */
  private patchHand(index: number, patch: Partial<Hand>): void {
    this.hands.update((hands) => hands.map((h, i) => (i === index ? { ...h, ...patch } : h)));
  }

  /** Annule les timers d'animation en cours. */
  private clearTimers(): void {
    clearTimeout(this.dealerTimer);
    clearTimeout(this.confettiTimer);
  }

  /** Message de fin de manche à partir du gain net. */
  private summary(net: number): string {
    if (net > 0) return `Gagné ! +${net} jetons 🎉`;
    if (net < 0) return `Perdu… ${net} jetons`;
    return 'Égalité, mises rendues.';
  }
}
