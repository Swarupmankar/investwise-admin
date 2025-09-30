import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface ScreenshotPreviewProps {
  imageUrl?: string;
  alt?: string;
  className?: string;
}

export function ScreenshotPreview({ imageUrl, alt = "Deposit screenshot", className }: ScreenshotPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!imageUrl) {
    return (
      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
        <span className="text-xs text-muted-foreground">No image</span>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="p-0 h-auto">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted group">
            <img 
              src={imageUrl} 
              alt={alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="p-4">
          <img 
            src={imageUrl} 
            alt={alt}
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}