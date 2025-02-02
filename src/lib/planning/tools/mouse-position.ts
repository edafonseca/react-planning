import { animationFrames, BehaviorSubject, distinctUntilChanged, fromEvent, map, Observable, sample, Subject } from "rxjs";

let source: Observable<MouseEvent>;
let frames: Observable<{ timestamp: number; elapsed: number }>;

const between = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));
const round = (value: number, decimals: number) => Math.round(value * 10 ** decimals) / 10 ** decimals;

const getSource = () => {
  if (!source) {
    source = new BehaviorSubject<MouseEvent>({ clientX: 0, clientY: 0, screenX: 0, screenY: 0 } as MouseEvent);
    fromEvent<MouseEvent>(window, "mousemove").subscribe(source);
    frames = animationFrames();
  }

  return source;
};

let mouseStateSource: Subject<MouseState>;

const getMouseStateSource = (): Subject<MouseState> => {
  if (!mouseStateSource) {
    mouseStateSource = new Subject<MouseState>();

    fromEvent<MouseEvent>(window, "mousedown").subscribe(() => {
      mouseStateSource.next('down');
    });

    fromEvent<MouseEvent>(window, "mouseup").subscribe(() => {
      mouseStateSource.next('up');
    });
  }

  return mouseStateSource;
}

export type MousePosition = {
  x: number;
  y: number;
  percentageX: number;
  percentageY: number;
  inside: boolean;
};

export type MouseState = "up" | "down";

export const listenMouseState = (): Subject<MouseState> => {
  return getMouseStateSource();
};

export const listenMousePosition = (
  reference: HTMLElement,
): Observable<MousePosition> => {
  const rect = reference.getBoundingClientRect();

  return getSource().pipe(
    map((event: MouseEvent) => {
      const x = Math.round(between(event.clientX - rect.x, 0, rect.width));
      const y = Math.round(between(event.clientY - rect.y, 0, rect.height));

      return {
        x,
        y,
        percentageX: round(x / rect.width, 4),
        percentageY: round(y / rect.height, 4),
        inside: event.clientX >= rect.x && event.clientX <= rect.x + rect.width,
      };
    }),
    distinctUntilChanged((prev, curr) =>
      prev.x === curr.x && prev.y === curr.y
    ),
    sample(frames)
  );
};


export const frame = () => animationFrames();
