/* AmbianceAudio — drone + vent doux opt-in (Web Audio API procedural) */

import { useEffect, useRef } from 'react';
import { getProfile } from '../../v2/state';

export default function AmbianceAudio() {
  const ctxRef = useRef(null);
  const stopRef = useRef(null);

  useEffect(() => {
    const enabled = getProfile().preferences?.ambianceSonore;
    if (!enabled) return;

    const start = () => {
      if (ctxRef.current) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        const ctx = new AC();
        ctxRef.current = ctx;

        // Drone
        const drone = ctx.createOscillator();
        drone.type = 'sine';
        drone.frequency.value = 110;
        const droneGain = ctx.createGain();
        droneGain.gain.value = 0.02;
        drone.connect(droneGain).connect(ctx.destination);
        drone.start();

        // Vent
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 600;
        filter.Q.value = 0.5;
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.015;
        noise.connect(filter).connect(noiseGain).connect(ctx.destination);
        noise.start();

        stopRef.current = () => {
          try { drone.stop(); noise.stop(); ctx.close(); } catch (e) {}
        };
      } catch (e) {
        // Silently fail si Web Audio non supporté
      }
      document.removeEventListener('touchstart', start);
      document.removeEventListener('click', start);
    };

    document.addEventListener('touchstart', start, { once: true });
    document.addEventListener('click', start, { once: true });

    return () => {
      document.removeEventListener('touchstart', start);
      document.removeEventListener('click', start);
      if (stopRef.current) stopRef.current();
    };
  }, []);

  return null;
}
