"use client";

import React, { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download } from 'lucide-react';

export default function Home() {
    const [images, setImages] = useState<{ src: string; file: File }[]>([]);
    const [backgroundColor, setBackgroundColor] = useState<string>('#ffb6c1');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const newImages = files.map(file => ({
                src: URL.createObjectURL(file),
                file: file,
            }));

            // Clean up previous object URLs
            images.forEach(image => URL.revokeObjectURL(image.src));

            setImages(newImages);
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleDownload = () => {
        if (images.length === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const bgColor = backgroundColor;
        images.forEach(({ src, file }) => {
            const img = new Image();
            img.onload = () => {
                const size = Math.max(img.naturalWidth, img.naturalHeight);
                canvas.width = size;
                canvas.height = size;

                // Fill background with the selected color
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, size, size);

                // Draw image centered
                const x = (size - img.naturalWidth) / 2;
                const y = (size - img.naturalHeight) / 2;
                ctx.drawImage(img, x, y);

                const link = document.createElement('a');
                let fileNameWithoutExtension = 'image'; // Default filename
                if (file && file.name) {
                    fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
                }
                const fileExtension = 'png'; // Always download as PNG
                link.download = `${fileNameWithoutExtension}-InstaSquare.${fileExtension}`;
                link.href = canvas.toDataURL('image/png');

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Clean up object URL after download
                URL.revokeObjectURL(src);
            };
            img.src = src;
        });
    };

    const handleClearImages = () => {
        images.forEach(image => URL.revokeObjectURL(image.src));
        setImages([]);
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen w-full bg-background p-4 sm:p-6 md:p-8">
            <Card className="w-full max-w-5xl shadow-xl rounded-2xl overflow-hidden">
                <div className="grid md:grid-cols-2">
                    {/* Controls Panel */}
                    <div className="p-8 flex flex-col justify-center">
                        <CardHeader className="p-0 mb-8">
                            <CardTitle className="font-headline text-4xl font-bold tracking-tight text-foreground">InstaSquare</CardTitle>
                            <CardDescription className="text-muted-foreground pt-2">
                                Create perfect square-fit images for your social media profiles.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 flex-grow flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label className="font-semibold text-foreground">1. Upload Image</Label>
                                <Button id="upload-btn" onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full justify-start text-left">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Select an image from your device...
                                </Button>
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*,image/heic,image/heif"
                                    multiple
                                    onChange={handleFileChange}
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label className="font-semibold text-foreground">2. Pick a Background Color</Label>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Label htmlFor="color-input"
                                            className="block w-12 h-12 rounded-lg border-2 border-border cursor-pointer transition-all hover:scale-105"
                                            style={{ backgroundColor: backgroundColor }} />
                                        <Input
                                            id="color-input"
                                            type="color"
                                            value={backgroundColor}
                                            onChange={(e) => setBackgroundColor(e.target.value)}
                                            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                            aria-label="Color Picker"
                                        />
                                    </div>
                                    <Input
                                        type="text" // Keep text input for manual hex code entry
                                        value={backgroundColor}
                                        onChange={(e) => setBackgroundColor(e.target.value)}
                                        className="font-mono text-base h-12"
                                        aria-label="Hex color value"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-0 mt-8">
                            <div className="grid grid-cols-1 gap-4 w-full">
                                <Button onClick={handleDownload} disabled={images.length === 0} size="lg" className="w-full text-lg py-7">
                                    <Download className="mr-3 h-5 w-5" />
                                    Download Image
                                </Button>
                                <Button onClick={handleClearImages} disabled={images.length === 0} size="lg" variant="destructive" className="w-full text-lg py-7">
                                    Clear All Images
                                </Button>
                            </div>

                        </CardFooter>
                    </div>

                    {/* Preview Panel */}
                    <div className="bg-muted/40 p-8 flex items-center justify-center">
                        <div
                            className="relative w-full aspect-square rounded-xl shadow-inner overflow-hidden transition-colors duration-300 grid grid-cols-1 auto-rows-fr"
                            style={{ backgroundColor: backgroundColor }}
                        >
                            {images.length > 0 ? (
                                <ScrollArea className="h-full w-full">
                                    <div className="grid grid-cols-1 gap-4 p-4">
                                        {images.map((image, index) => (
                                            <div key={index} className="relative w-full h-full flex items-center justify-center">
                                                <img
                                                    src={image.src}
                                                    alt={`Preview ${index + 1}`}
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <ScrollBar />
                                </ScrollArea>
                            ) : (
                                <div className="flex items-center justify-center h-full text-center text-muted-foreground p-8">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="p-4 bg-background/50 rounded-full">
                                            <Upload className="h-10 w-10" />
                                        </div>
                                        <p className="font-medium">Your image preview will appear here</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
            <canvas ref={canvasRef} className="hidden" aria-hidden="true"></canvas>
            <footer className="text-center mt-8 text-muted-foreground text-sm">
                <p>Created with 💜 for awesome content creators.</p>
            </footer>
        </main>
    );
}
