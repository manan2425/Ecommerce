import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function AuthRequiredModal({ isOpen, onClose, message = "Login or register to view product details and make purchases" }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate('/auth/login');
  };

  const handleRegister = () => {
    onClose();
    navigate('/auth/register');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Authentication Required</DialogTitle>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-6">
          <Button 
            onClick={handleLogin}
            className="w-full"
          >
            Login
          </Button>
          <Button 
            onClick={handleRegister}
            variant="outline"
            className="w-full"
          >
            Register
          </Button>
          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            Continue Browsing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
