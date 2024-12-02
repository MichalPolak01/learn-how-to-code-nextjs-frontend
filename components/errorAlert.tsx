"use client"

import { Button } from "@nextui-org/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/modal";

interface ErrorModalProps {
  header: string;
  body: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ErrorAlert({ header, body, isOpen, onClose }: ErrorModalProps) {
  return (
    <Modal
      backdrop="blur"
      className="p-4"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20"
      }}
      isOpen={isOpen}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
      size="lg"
      onOpenChange={onClose}
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1 text-2xl text-danger font-medium">{header}</ModalHeader>
          <ModalBody>{body}</ModalBody>
          <ModalFooter className="mt-4">
            <Button color="danger" variant="shadow" onPress={onClose}>
              Ok
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}