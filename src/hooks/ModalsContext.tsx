import React, {
    createContext,
    useCallback,
    useState,
    useMemo,
    PropsWithChildren,
    useContext,
  } from 'react';
  import { Modal, ModalProps } from 'antd';
  
  /**
   * Define the type for the content we want to display inside the modal.
   * Typically, you might just use React.ReactNode for content.
   */
  interface CustomModalProps extends Omit<ModalProps, 'visible' | 'onCancel' | 'children'> {
    content?: React.ReactNode;
  }
  
  /**
   * The shape of the context value.
   */
  interface ModalsContextValue {
    openModal: (modalProps: CustomModalProps) => void;
    closeModal: () => void;
  }
  
  /**
   * Create the context with a default value.
   * (These methods will be overridden by the provider)
   */
  const ModalsContext = createContext<ModalsContextValue>({
    openModal: () => {},
    closeModal: () => {},
  });
  
  /**
   * Create a provider to wrap our entire app.
   * This provider holds the state of the currently open modal (if any).
   */
  export const ModalsProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [modalState, setModalState] = useState<CustomModalProps | null>(null);
  
    const openModal = useCallback((props: CustomModalProps) => {
      setModalState(props);
    }, []);
  
    const closeModal = useCallback(() => {
      setModalState(null);
    }, []);
  
    /**
     * We memoize the context value so that it doesn’t trigger rerenders unnecessarily.
     */
    const contextValue = useMemo<ModalsContextValue>(
      () => ({
        openModal,
        closeModal,
      }),
      [openModal, closeModal]
    );
  
    return (
      <ModalsContext.Provider value={contextValue}>
        {children}
  
        {/* Our “global” modal – shown only if modalState is non-null */}
        <Modal
          open={!!modalState}
          onCancel={closeModal}
          // Spread any other props we passed in, e.g. title, footer, etc.
          {...(modalState || {})}
        >
          {modalState?.content}
        </Modal>
      </ModalsContext.Provider>
    );
  };
  
  /**
   * Helper hook to consume the context in any child component.
   */
  export const useModals = (): ModalsContextValue => {
    return useContext(ModalsContext);
  };
  