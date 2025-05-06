import { ref } from "vue";

const objects = ref([]);
const elementRefs = ref({});

const ANIMATION_CONFIG = {
  duration: animation.duration,
  easing: animation.ease || "linear",
  fill: animation.fillMode || "forwards",
  delay: animation.delay || 0,
  iterations: animation.count === 0 ? Infinity : animation.count || 1,
  direction: animation.direction || "normal",
  composite: "replace",
};

const handleTrigger = (objectId, triggerType) => {
  // 페이지 로드 시 동작하는 이벤트 타입
  if (triggerType === "load") {
    const matchingAnimations = objects.value[0]?.pageData?.pageAnimation;
    if (!matchingAnimations) {
      return;
    }

    // 페이지 로드 시 애니메이션 전부 실행
    Promise.all(
      matchingAnimations.animation.map((anim) => {
        Promise.all(
          anim.actionTarget.map((target) => {
            return executeAnimation(target, anim);
          })
        );
      })
    )
      .then(() => {
        console.log("All animations completed");
      })
      .catch((error) => {
        console.error("Animation error:", error);
      });
  } else {
    // 페이지 로드가 아닌 클릭 등 사용자 인터렉션에 의한 이벤트
    const targetObject = objects.value
      .flatMap((page) => page.objectsData)
      .find((obj) => obj.uuid === objectId);
    if (!targetObject) return;

    const matchingAnimationGroups =
      targetObject.objectAnimation?.filter(
        (data) => data.triggerType === triggerType
      ) || [];
    if (matchingAnimationGroups.length === 0) return;

    // 모든 애니메이션 그룹을 순차적으로 실행
    matchingAnimationGroups
      .reduce(async (previousPromise, animGroup) => {
        await previousPromise; // 이전 애니메이션 그룹이 완료될 때까지 대기

        if (animGroup.isSimultaneousness) {
          // 동시 실행 애니메이션
          return Promise.all(
            animGroup.animation.map((anim) => {
              return executeAnimation(anim.actionTarget || objectId, anim);
            })
          );
        } else {
          // 순차 실행 애니메이션
          return animGroup.animation.reduce(async (promise, anim) => {
            await promise;
            return executeAnimation(anim.actionTarget || objectId, anim);
          }, Promise.resolve());
        }
      }, Promise.resolve())
      .then(() => {
        console.log("All animation groups completed");
      })
      .catch((error) => {
        console.error("Animation group error:", error);
      });
  }
};

const executeAnimation = (objectId, animation) => {
  const element = elementRefs.value[objectId];
  if (!element) return;

  const targetObject = objects.value
    .flatMap((page) => page.objectsData)
    .find((obj) => obj.uuid === objectId);
  if (!targetObject) return;

  switch (animation.actionType) {
    case "translate": {
      const animPoints = animation.actionSetting.points;
      if (!animPoints || !Array.isArray(animPoints) || animPoints.length < 1)
        return;

      const targetIds = Array.isArray(animation.actionTarget)
        ? animation.actionTarget
        : [animation.actionTarget || objectId];

      const animationPromises = targetIds.map((targetId) => {
        const targetObjectForMove = objects.value
          .flatMap((page) => page.objectsData)
          .find((obj) => obj.uuid === targetId);

        if (!targetObjectForMove) return Promise.resolve();

        const moveCurrentPosition = { ...targetObjectForMove.position };

        const createLineKeyframes = (points) => {
          return points.map((point) => ({
            transform: `translate(${point.x - moveCurrentPosition.x}px, ${
              point.y - moveCurrentPosition.y
            }px)`,
          }));
        };

        const effectivePoints =
          animPoints[0].x === 0 && animPoints[0].y === 0
            ? [moveCurrentPosition, ...animPoints.slice(1)]
            : animPoints;

        const keyframes = createLineKeyframes(effectivePoints);

        const targetElement = elementRefs.value[targetId];
        if (!targetElement) return Promise.resolve();

        const moveAnimation = targetElement.animate(
          keyframes,
          ANIMATION_CONFIG
        );

        return new Promise((resolve) => {
          moveAnimation.onfinish = () => {
            resolve();
          };
        });
      });

      return Promise.all(animationPromises);
    }

    case "scale": {
      const targetElement = getFirstChildElement(element);
      if (!targetElement) return;

      const currentRotate = targetElement.style.transform.includes("rotate")
        ? targetElement.style.transform.match(/rotate\((.*?)deg\)/)[0]
        : "";

      const transformOrigin = getTransformOriginCenter(targetElement);
      targetElement.style.transformOrigin = transformOrigin;

      const scaleAnimation = targetElement.animate(
        [
          {
            transformOrigin,
            transform: `scale(${animation.actionSetting.scaleStart}) ${currentRotate}`,
          },
          {
            transformOrigin,
            transform: `scale(${animation.actionSetting.scaleEnd}) ${currentRotate}`,
          },
        ],
        ANIMATION_CONFIG
      );

      return new Promise((resolve) => {
        scaleAnimation.onfinish = () => {
          if (animation.fillMode === "forwards") {
            targetElement.style.transform = `scale(${animation.actionSetting.scaleEnd}) ${currentRotate}`;
            targetElement.style.transformOrigin = transformOrigin;
          }
          resolve();
        };
      });
    }

    case "rotate": {
      const targetElement = getFirstChildElement(element);
      if (!targetElement) return;

      const currentScale = targetElement.style.transform.includes("scale")
        ? targetElement.style.transform.match(/scale\((.*?)\)/)[0]
        : "scale(1)";

      const rotationDegree = animation.actionSetting.degree || 0;
      const rotationCount =
        animation.actionSetting.count === 1 ? 0 : animation.actionSetting.count;
      const totalRotation =
        rotationDegree > 0
          ? rotationDegree + rotationCount * 360
          : rotationDegree + -1 * rotationCount * 360;

      let centerX, centerY;
      if (targetObject.diagramType === "rectangle") {
        centerX = targetObject.position.x + targetObject.size.width / 2;
        centerY = targetObject.position.y + targetObject.size.height / 2;
      } else {
        centerX =
          targetObject.position.x + (targetObject.style.centerPoint?.x || 0);
        centerY =
          targetObject.position.y + (targetObject.style.centerPoint?.y || 0);
      }

      const rotateAnimation = targetElement.animate(
        [
          {
            transformOrigin: `${centerX}px ${centerY}px`,
            transform: `rotate(${targetObject.style.rotationAngle}deg) ${currentScale}`,
          },
          {
            transformOrigin: `${centerX}px ${centerY}px`,
            transform: `rotate(${
              targetObject.style.rotationAngle + totalRotation
            }deg) ${currentScale}`,
          },
        ],
        {
          ...ANIMATION_CONFIG,
          iterations: 1,
        }
      );

      return new Promise((resolve) => {
        rotateAnimation.onfinish = () => {
          if (animation.fillMode === "forwards") {
            targetElement.style.transform = `rotate(${
              targetObject.style.rotationAngle + totalRotation
            }deg) ${currentScale}`;
            targetElement.style.transformOrigin = `${centerX}px ${centerY}px`;

            targetObject.style.rotationAngle =
              (((targetObject.style.rotationAngle + totalRotation) % 360) +
                360) %
              360;
          }
          resolve();
        };
      });
    }

    case "opacity":
      element.animate(
        [{ opacity: animation.actionSetting.opacity }],
        ANIMATION_CONFIG
      );
      break;

    case "color":
      const colorElement = getFirstChildElement(element);
      if (!colorElement) return;
      colorElement.animate(
        [
          { fill: colorElement.getAttribute("fill") },
          { fill: animation.actionSetting.color },
        ],
        ANIMATION_CONFIG
      );

      break;
    // ...
  }
};
