import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/AuthForm";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-card border-2 border-border">
        <DialogHeader className="sr-only">
          <DialogTitle>Sign in or create account</DialogTitle>
        </DialogHeader>
        <AuthForm
          onAuthenticated={() => {
            onOpenChange(false);
            navigate("/dashboard");
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
