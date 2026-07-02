import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card, Outcome } from '../../core/models/card.model';
import {
  Shoe, handValue, isBlackjack, isRed, recommend, actionLabel,
} from '../../core/engine';
import { StatsService } from '../../core/services/stats.service';
import { ProgressionService } from '../../core/services/progression.service';
import { PersistenceService } from '../../core/services/persistence.service';

type Phase = 'bet' | 'player' | 'done';

@Component({
  selector: 'app-classique',
  imports: [RouterLink],
  templateUrl: './classique.html',
  styleUrl: './classique.scss',
})
export class Classique {
  private readonly stats = inject(StatsService);
  private readonly progression = inject(ProgressionService);
  private readonly store = inject(PersistenceService);
  private readonly shoe = new Shoe(6);
  private readonly BANK_KEY = 'bj_free_bankroll';

  protected readonly bankroll = signal<number>(this.store.get(this.BANK_KEY, 1000));
  protected readonly bet = signal(0);
  protected readonly player = signal<Card[]>([]);
  protected readonly dealer = signal<Card[]>([]);
  protected readonly phase = signal<Phase>('bet');
  protected readonly revealed = signal(false);
  protected readonly message = signal('Placez votre mise.');
  protected readonly chips = [5, 25, 100, 500];

  protected readonly playerValue = computed(() => handValue(this.player()).total);
  protected readonly dealerValue = computed(() => handValue(this.dealer()).total);
  protected readonly canDouble = computed(
    () => this.phase() === 'player' && this.player().length === 2 && this.bankroll() >= this.bet(),
  );
  protected readonly hint = computed(() => {
    if (this.phase() !== 'player' || this.dealer().length < 2) return '';
    const advice = recommend(this.player(), this.dealer()[1], this.canDouble(), false);
    return actionLabel(advice.code, this.canDouble());
  });

  protected red(c: Card): boolean { return isRed(c.suit); }

  protected addBet(v: number): void {
    if (this.phase() !== 'bet') return;
    if (this.bet() + v <= this.bankroll()) this.bet.update((b) => b + v);
  }
  protected clearBet(): void { this.bet.set(0); }

  protected deal(): void {
    if (this.bet() <= 0 || this.bet() > this.bankroll()) return;
    this.setBankroll(this.bankroll() - this.bet());
    this.player.set([this.shoe.draw(), this.shoe.draw()]);
    this.dealer.set([this.shoe.draw(), this.shoe.draw()]);
    this.revealed.set(false);
    this.phase.set('player');
    this.message.set('À vous de jouer.');
    if (isBlackjack(this.player()) || isBlackjack(this.dealer())) this.finish();
  }

  protected hit(): void {
    this.player.update((cs) => [...cs, this.shoe.draw()]);
    if (handValue(this.player()).total > 21) this.finish();
  }
  protected stand(): void { this.finish(); }
  protected double(): void {
    if (!this.canDouble()) return;
    this.setBankroll(this.bankroll() - this.bet());
    this.bet.update((b) => b * 2);
    this.player.update((cs) => [...cs, this.shoe.draw()]);
    this.finish();
  }

  private finish(): void {
    const pBJ = isBlackjack(this.player());
    const dBJ = isBlackjack(this.dealer());
    this.revealed.set(true);
    const playerBust = handValue(this.player()).total > 21;
    if (!playerBust && !pBJ && !dBJ) {
      const d = [...this.dealer()];
      while (handValue(d).total < 17) d.push(this.shoe.draw());
      this.dealer.set(d);
    }

    const pv = handValue(this.player()).total;
    const dv = handValue(this.dealer()).total;
    let result: Outcome;
    if (pv > 21) result = 'loss';
    else if (pBJ && dBJ) result = 'push';
    else if (pBJ) result = 'bj';
    else if (dBJ) result = 'loss';
    else if (dv > 21 || pv > dv) result = 'win';
    else if (pv < dv) result = 'loss';
    else result = 'push';

    const bet = this.bet();
    let payout = 0;
    if (result === 'bj') payout = bet * 2.5;
    else if (result === 'win') payout = bet * 2;
    else if (result === 'push') payout = bet;
    this.setBankroll(this.bankroll() + payout);

    const net = payout - bet;
    this.stats.recordHand(result, bet);
    this.stats.recordNet(net);
    this.progression.addXp(result === 'bj' ? 15 : 8);

    this.message.set(this.resultMessage(result, net));
    this.phase.set('done');
  }

  protected newRound(): void {
    this.player.set([]);
    this.dealer.set([]);
    this.revealed.set(false);
    if (this.bet() > this.bankroll()) this.bet.set(0);
    this.phase.set('bet');
    this.message.set(this.bankroll() <= 0 ? 'Plus de jetons ! Réinitialisez.' : 'Placez votre mise.');
  }
  protected reset(): void { this.setBankroll(1000); this.bet.set(0); this.newRound(); }

  private setBankroll(v: number): void { this.bankroll.set(v); this.store.set(this.BANK_KEY, v); }
  private resultMessage(r: Outcome, net: number): string {
    if (r === 'bj') return `Blackjack ! +${net} jetons 🎉`;
    if (r === 'win') return `Gagné ! +${net} jetons`;
    if (r === 'push') return 'Égalité, mise rendue.';
    return `Perdu… ${net} jetons`;
  }
}
