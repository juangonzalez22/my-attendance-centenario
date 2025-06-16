// lib/sounds.js
import { Howl } from 'howler';

export const clickSound = new Howl({
  src: ['/sounds/click.ogg'], // Solo archivo .ogg
  volume: 0.5,
});

export const errorSound = new Howl({
  src: ['/sounds/error.ogg'],
  volume: 0.5,
});

export const registeredSound = new Howl({
  src: ['/sounds/registered.ogg'],
  volume: 0.5,
});
