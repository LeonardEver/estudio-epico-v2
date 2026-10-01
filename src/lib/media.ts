/** Playing one example stops other examples and the presentation video. */
export function pauseOtherMedia(active: HTMLMediaElement): void {
  document.querySelectorAll<HTMLMediaElement>("audio, video").forEach((media) => {
    if (media !== active) media.pause();
  });
}
