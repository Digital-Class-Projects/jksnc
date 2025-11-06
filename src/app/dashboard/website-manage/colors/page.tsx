
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDatabase } from "@/firebase";
import { ref, set, onValue } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { SuccessDialog } from "@/components/success-dialog";
import { HexColorPicker } from "react-colorful";

type ThemeColors = {
  primary: string;
  background: string;
  accent: string;
};

// Helper to convert hex to HSL string
const hexToHslString = (hex: string): string => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
}


export default function ColorsPage() {
  const { toast } = useToast();
  const database = useDatabase();
  const [colors, setColors] = useState<ThemeColors>({
    primary: "#5b36f5",
    background: "#f0f2f5",
    accent: "#9B51E0",
  });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    if (!database) return;
    const colorsRef = ref(database, 'websiteContent/themeColors');
    const unsubscribe = onValue(colorsRef, (snapshot) => {
      if (snapshot.exists()) {
        setColors(snapshot.val() as ThemeColors);
      }
    });
    return () => unsubscribe();
  }, [database]);

  const handleColorChange = (colorName: keyof ThemeColors) => (newColor: string) => {
    setColors(prev => ({ ...prev, [colorName]: newColor }));
  };

  const handlePublish = async () => {
    if (!database) {
        toast({ variant: "destructive", title: "Database not available" });
        return;
    }
    
    // Convert hex colors to HSL strings before saving
    const themeToSave = {
        primary: hexToHslString(colors.primary),
        background: hexToHslString(colors.background),
        accent: hexToHslString(colors.accent),
    };

    const colorsRef = ref(database, 'websiteContent/themeCss');
    try {
        await set(colorsRef, themeToSave);
        
        // Also save the hex values for the color pickers
        const hexColorsRef = ref(database, 'websiteContent/themeColors');
        await set(hexColorsRef, colors);

        setShowSuccessDialog(true);
    } catch (error) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: (error as Error).message,
        });
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Manage Website Colors</CardTitle>
          <CardDescription>
            Pick the main colors for your public website theme. The changes will be applied live.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4 flex flex-col items-center">
                    <Label htmlFor="primary" className="text-lg font-medium">Primary Color</Label>
                    <HexColorPicker color={colors.primary} onChange={handleColorChange('primary')} />
                    <Input id="primary" value={colors.primary} onChange={(e) => handleColorChange('primary')(e.target.value)} className="w-48 text-center" />
                </div>
                 <div className="space-y-4 flex flex-col items-center">
                    <Label htmlFor="background" className="text-lg font-medium">Background Color</Label>
                    <HexColorPicker color={colors.background} onChange={handleColorChange('background')} />
                    <Input id="background" value={colors.background} onChange={(e) => handleColorChange('background')(e.target.value)} className="w-48 text-center" />
                </div>
                 <div className="space-y-4 flex flex-col items-center">
                    <Label htmlFor="accent" className="text-lg font-medium">Accent Color</Label>
                    <HexColorPicker color={colors.accent} onChange={handleColorChange('accent')} />
                    <Input id="accent" value={colors.accent} onChange={(e) => handleColorChange('accent')(e.target.value)} className="w-48 text-center" />
                </div>
            </div>
          
          <div className="flex justify-center">
            <Button onClick={handlePublish} size="lg">Publish Colors</Button>
          </div>
        </CardContent>
      </Card>
      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        title="Colors Updated!"
        description="Your new color theme has been published."
      />
    </div>
  );
}
