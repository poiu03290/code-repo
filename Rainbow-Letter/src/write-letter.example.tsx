export const setActiveTabSessionId = (sessionId: string) => {
  return sessionStorage.setItem("activeTab", sessionId);
};

export const getActiveTabSessionId = () => {
  return sessionStorage.getItem("activeTab");
};

export const useLetterPaperModel = (
  letterContent: LetterContent,
  savedLetter: SavedLetter,
  setLetterContent: React.Dispatch<React.SetStateAction<LetterContent>>,
  exists: boolean,
  selectedPet: PetListResponse | null,
  setSavedLetter: React.Dispatch<React.SetStateAction<SavedLetter>>
) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const { setSaveStatus } = useSaveStatusStore();

  const { openModal } = useModal();

  // NOTE: 편지 자동 저장 로직 start
  const createSavedLetter = useCallback(async () => {
    const newSaveLetterData = {
      petId: selectedPet?.id,
      content: letterContent.content,
    };

    const { id, sessionId } = await temporariesApi.generateSavedLetter(
      newSaveLetterData
    );
    setActiveTabSessionId(sessionId);
    setSavedLetter((prev) => ({ ...prev, id }));
    setIsInitialized(true);
  }, [selectedPet?.id, letterContent.content, setSavedLetter]);

  const fetchSavedLetter = useCallback(async () => {
    if (!selectedPet?.id) return;

    const data = await temporariesApi.getSavedLetter(selectedPet?.id);

    setLetterContent((prev: LetterContent) => ({
      ...prev,
      content: data?.content,
      summary: data?.content.slice(0, 20),
    }));

    setSavedLetter((prev) => ({
      ...prev,
      id: data?.id,
      contents: data?.content,
    }));

    return data?.id;
  }, [selectedPet?.id, setLetterContent, setSavedLetter]);

  const updateSessionId = async (id: number) => {
    if (!id) return;

    const { sessionId } = await temporariesApi.updateSessionId(id);

    setActiveTabSessionId(sessionId);
  };

  const handleSavedLetterSession = useCallback(async () => {
    const id = await fetchSavedLetter();
    await updateSessionId(id);
  }, [fetchSavedLetter]);

  // 편지쓰기 입장 시 저장 편지가 있는지 체크
  useEffect(() => {
    (async () => {
      if (exists === undefined) return;
      if (exists) {
        return handleSavedLetterSession();
      }

      return createSavedLetter();
    })();
  }, [exists, handleSavedLetterSession]);

  // 편지 서버에 저장
  useEffect(() => {
    const saveLetterValue = async () => {
      try {
        if ((exists || isInitialized) && savedLetter.id) {
          const newData = {
            petId: selectedPet?.id,
            content: letterContent?.content,
          };
          await temporariesApi.updateSavedLetter(savedLetter.id, newData);
          setSaveStatus("COMPLETE");
        }
      } catch (err) {
        console.warn(err);
        setSaveStatus("FAIL");
      }
    };

    const autoSaveLetter = setTimeout(() => {
      saveLetterValue();

      clearTimeout(autoSaveLetter);
    }, 3000);

    return () => clearTimeout(autoSaveLetter);
  }, [
    letterContent.content,
    exists,
    selectedPet?.id,
    savedLetter,
    isInitialized,
  ]);

  // 다른 탭에서 접속 체크
  useEffect(() => {
    const compareSessionId = async () => {
      if (!exists || !savedLetter.id) return;

      try {
        const data = await temporariesApi.getSavedLetter(selectedPet?.id);
        if (!data) return;

        const isTabLive = getActiveTabSessionId();
        if (data.sessionId !== isTabLive) {
          openModal(<SaveOverlapModal />);
        }
      } catch (error) {
        return;
      }
    };

    const isCheckTabLive = setInterval(() => {
      if (selectedPet?.id) {
        compareSessionId();
      }
    }, 5000);

    return () => clearInterval(isCheckTabLive);
  }, [selectedPet?.id, exists, isInitialized, savedLetter.id]);

  return {
    textareaRef,
    isExceeded,
    checkMaxLength,
    handleResizeHeight,
    handleTextarea,
    handleInfoModal,
    getLetterTarget,
  };
};
