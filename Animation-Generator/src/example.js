if (triggerType === "load") {
  const matchingAnimations = objects.value[0]?.pageData?.pageAnimation;
  if (!matchingAnimations) {
    return;
  }

  let currentAnimationIndex = 0;
  const animations = matchingAnimations.animation;
  const startTime = performance.now();

  const runAnimation = (currentTime) => {
    const elapsedTime = currentTime - startTime;
    const currentAnim = animations[currentAnimationIndex];

    if (!currentAnim) {
      return;
    }

    if (elapsedTime >= currentAnim.delay) {
      Promise.all(
        currentAnim.actionTarget.map((target) => {
          return executeAnimation(target, { ...currentAnim, delay: 0 });
        })
      ).then(() => {
        currentAnimationIndex++;
        if (currentAnimationIndex < animations.length) {
          requestAnimationFrame(runAnimation);
        }
      });
    } else {
      requestAnimationFrame(runAnimation);
    }
  };

  requestAnimationFrame(runAnimation);
} else {
  // ...
}
