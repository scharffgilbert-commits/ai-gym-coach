import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductFound: (product: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
}

export function BarcodeScanner({ open, onOpenChange, onProductFound }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (open && !scanning) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [open]);

  const startScanner = async () => {
    try {
      setScanning(true);
      
      const html5QrCode = new Html5Qrcode("barcode-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        (decodedText) => {
          handleBarcodeScan(decodedText);
        },
        () => {
          // Ignore scan errors
        }
      );
    } catch (err) {
      console.error("Error starting scanner:", err);
      toast.error("Kamera konnte nicht gestartet werden");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setScanning(false);
  };

  const handleBarcodeScan = async (barcode: string) => {
    if (loading) return;
    
    setLoading(true);
    await stopScanner();

    try {
      // Fetch from Open Food Facts API
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
      );
      
      if (!response.ok) {
        throw new Error("Produkt nicht gefunden");
      }

      const data = await response.json();

      if (data.status !== 1 || !data.product) {
        toast.error("Produkt nicht in der Datenbank gefunden");
        onOpenChange(false);
        return;
      }

      const product = data.product;
      const nutriments = product.nutriments || {};

      const productData = {
        name: product.product_name || product.product_name_de || "Unbekanntes Produkt",
        calories: Math.round(nutriments["energy-kcal_100g"] || nutriments["energy-kcal"] || 0),
        protein: Math.round((nutriments.proteins_100g || nutriments.proteins || 0) * 10) / 10,
        carbs: Math.round((nutriments.carbohydrates_100g || nutriments.carbohydrates || 0) * 10) / 10,
        fat: Math.round((nutriments.fat_100g || nutriments.fat || 0) * 10) / 10,
      };

      toast.success(`Gefunden: ${productData.name}`);
      onProductFound(productData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Produkt konnte nicht geladen werden");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    stopScanner();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Barcode scannen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div 
            id="barcode-reader" 
            className="w-full min-h-[300px] bg-muted rounded-lg overflow-hidden"
          />

          {loading && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Produkt wird gesucht...</span>
            </div>
          )}

          <p className="text-sm text-muted-foreground text-center">
            Halte den Barcode vor die Kamera. Die Nährwerte werden automatisch aus der Open Food Facts Datenbank geladen.
          </p>

          <Button 
            variant="outline" 
            onClick={handleClose} 
            className="w-full gap-2"
          >
            <X className="h-4 w-4" />
            Abbrechen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
