(() => {
  const box = document.querySelector('.box-3d');
  const stage = box.parentElement;
  let pointer = null;
  let lastX = 0, lastY = 0;
  let pitch = -17, yaw = -30;

  function rotate(deltaPitch, deltaYaw) {
    pitch = Math.max(-90, Math.min(90, pitch + deltaPitch));
    yaw = (yaw + deltaYaw) % 360;
    box.style.transform = `rotateX(${pitch}deg) rotateY(${yaw}deg)`;
  }

  stage.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || pointer !== null) return;
    pointer = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    stage.setPointerCapture(pointer);
    stage.classList.add('is-dragging');
  });
  stage.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointer) return;
    rotate((lastY - event.clientY) * 0.55, (event.clientX - lastX) * 0.65);
    lastX = event.clientX;
    lastY = event.clientY;
  });
  stage.addEventListener('lostpointercapture', (event) => {
    if (event.pointerId !== pointer) return;
    pointer = null;
    stage.classList.remove('is-dragging');
  });
  stage.addEventListener('keydown', (event) => {
    const steps = { ArrowUp: [-15, 0], ArrowDown: [15, 0],
                    ArrowLeft: [0, -15], ArrowRight: [0, 15],
                    Home: [-17 - pitch, -30 - yaw] };
    if (!Object.hasOwn(steps, event.key)) return;
    event.preventDefault();
    rotate(...steps[event.key]);
  });
})();
