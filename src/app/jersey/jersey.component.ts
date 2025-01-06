import { Component, HostBinding, Input } from "@angular/core";

@Component({
  selector: "app-jersey",
  template: `
    <div class="name">{{ player?.lastName }}</div>
    <div class="number">{{ player?.number }}</div>
  `,
  styleUrls: ["./jersey.component.scss"],
})
export class JerseyComponent {
  @Input() player: any;

  @HostBinding("class") get classes() {
    if (
      this.player == null ||
      this.player.position == null ||
      this.player.line == null
    ) {
      return "hidden";
    }

    return `pos-${this.player.position} line-${this.player.line}`;
  }
}
