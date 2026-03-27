import { useState, useCallback } from 'react';
import { ModalType } from '../components/AppModal';

export interface AppModalConfig {
  type?: ModalType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  showCancel?: boolean;
}

export const useAppModal = () => {
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<AppModalConfig>({ title: '', message: '' });

  const showModal = useCallback((modalConfig: AppModalConfig) => {
    setConfig(modalConfig);
    setVisible(true);
    setIsLoading(false);
  }, []);

  const hideModal = useCallback(() => {
    setVisible(false);
    setIsLoading(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (config.onConfirm) {
      setIsLoading(true);
      try {
        await config.onConfirm();
        hideModal();
      } catch {
        setIsLoading(false);
      }
    } else {
      hideModal();
    }
  }, [config, hideModal]);

  const handleCancel = useCallback(() => {
    if (config.onCancel) config.onCancel();
    hideModal();
  }, [config, hideModal]);

  return { visible, isLoading, config, showModal, hideModal, handleConfirm, handleCancel };
};
