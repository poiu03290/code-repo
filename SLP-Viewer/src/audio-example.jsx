import { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import Speaker from "@images/im_speaker.png";

export default function AudioButton({
  replayAudio,
  audioFiles,
  setIsCompletedAudioFile,
  isCompletedAudioFile,
  setIsCompletedReply,
}) {
  const [audioIndex, setAudioIndex] = useState(0); // 현재 재생 중인 오디오 파일 인덱스
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef(null); // Howl 객체 참조를 위한 useRef
  const replaySoundRef = useRef(null); // Howl 객체 참조를 위한 useRef
  const currentAudio = audioFiles[audioIndex] || [];

  // 오디오 파일 로드 및 재생
  useEffect(() => {
    if (!isCompletedAudioFile && audioFiles.length > 0 && !isPlaying) {
      const playAudio = () => {
        // 기존에 재생 중인 오디오가 있으면 먼저 정리
        if (soundRef.current) {
          soundRef.current.stop();
          soundRef.current.unload();
          soundRef.current = null;
        }

        const sound = new Howl({
          html5: true,
          src: [currentAudio],
          autoplay: true,
          onplayerror: function () {
            if (isPlaying) return;
            sound.once("unlock", function () {
              sound.play();
              setIsPlaying(true);
            });
          },
          onload: function () {
            setIsPlaying(true);
          },
          onend: function () {
            sound.unload();
            setIsPlaying(false);
            if (audioIndex < audioFiles.length - 1) {
              setAudioIndex((prevIndex) => prevIndex + 1); // 다음 오디오 파일로 이동
            } else {
              setIsCompletedAudioFile(true); // 마지막 오디오 재생 완료 처리
            }
          },
        });

        sound.play();
        soundRef.current = sound; // Howl 객체 저장
      };

      playAudio();
    }
  }, [currentAudio, isCompletedAudioFile]);

  // 오디오 중지 및 Howl 객체 정리
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.unload();
        soundRef.current = null;
        setIsPlaying(false);
      }
      if (replaySoundRef.current) {
        replaySoundRef.current.stop();
        replaySoundRef.current.unload();
        replaySoundRef.current = null;
        setIsPlaying(false);
      }
    };
  }, []);

  // 재생 버튼 클릭 시
  const handleClick = () => {
    if (isCompletedAudioFile) {
      if (isPlaying) return;

      if (replaySoundRef.current) {
        replaySoundRef.current.stop();
        replaySoundRef.current.unload();
        replaySoundRef.current = null;
      }

      const replaySound = new Howl({
        html5: true,
        src: [replayAudio],
        onplayerror: function () {
          if (isPlaying) return;
          replaySound.once("unlock", function () {
            replaySound.play();
            setIsPlaying(true);
          });
        },
        onload: function () {
          replaySoundRef.current = replaySound;
          setIsPlaying(true);
        },
        onend: function () {
          replaySound.unload();
          setIsPlaying(false);
          setIsCompletedReply(true);
        },
      });

      replaySound.play();
    }
  };

  return (
    <div className="absolute right-8 top-6">
      {!isPlaying ? (
        <button onClick={handleClick} className="size-16">
          <img src={Speaker} alt="speaker-icon" />
        </button>
      ) : (
        <button className="relative size-[60px] bg-audio bg-[length:60px_60px] bg-no-repeat">
          <div className="flex items-center justify-center gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`animate-${i}`}
                className={`${
                  i % 2 === 0 ? "animate-edge" : "animate-center"
                } w-1 rounded-sm bg-white`}
              />
            ))}
          </div>
        </button>
      )}
    </div>
  );
}
