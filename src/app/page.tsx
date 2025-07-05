"use client";

import React, { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download } from 'lucide-react';

export default function Home() {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [imageElementForCanvas, setImageElementForCanvas] = useState<HTMLImageElement | null>(null);
    const [bgColor, setBgColor] = useState<string>('#ffb6c1'); // pale rose

    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Clean up Object URL to prevent memory leaks
    useEffect(() => {
        return () => {
            if (imageSrc) {
                URL.revokeObjectURL(imageSrc);
            }
        };
    }, [imageSrc]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newImageSrc = URL.createObjectURL(file);

            if (imageSrc) {
                URL.revokeObjectURL(imageSrc);
            }
            setImageSrc(newImageSrc);

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    setImageElementForCanvas(img);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleDownload = () => {
        if (!imageElementForCanvas || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = Math.max(imageElementForCanvas.naturalWidth, imageElementForCanvas.naturalHeight);
        canvas.width = size;
        canvas.height = size;

        // Fill background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);

        // Draw image centered
        const x = (size - imageElementForCanvas.naturalWidth) / 2;
        const y = (size - imageElementForCanvas.naturalHeight) / 2;
        ctx.drawImage(imageElementForCanvas, x, y);

        const link = document.createElement('a');
        if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]) {
            const originalFileName = fileInputRef.current.files[0].name;
            const fileExtension = originalFileName.split('.').pop() || 'png';
            const fileNameWithoutExtension = originalFileName.replace(/\.[^/.]+$/, "");
            link.download = `${fileNameWithoutExtension}-InstaSquare.${fileExtension}`;
        } else {
            link.download = 'InstaSquare.png';
        }
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                                <Button id="upload-btn" onClick={handleUploadClick} variant="outline" className="w-full justify-start text-left">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Select an image from your device...
                                </Button>
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*,image/heic,image/heif"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label className="font-semibold text-foreground">2. Pick a Background Color</Label>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Label htmlFor="color-input"
                                            className="block w-12 h-12 rounded-lg border-2 border-border cursor-pointer transition-all hover:scale-105"
                                            style={{ backgroundColor: bgColor }} />
                                        <Input
                                            id="color-input"
                                            type="color"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                            aria-label="Color Picker"
                                        />
                                    </div>
                                    <Input
                                        type="text"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="font-mono text-base h-12"
                                        aria-label="Hex color value"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-0 mt-8">
                            <Button onClick={handleDownload} disabled={!imageSrc} size="lg" className="w-full text-lg py-7">
                                <Download className="mr-3 h-5 w-5" />
                                Download Image
                            </Button>
                        </CardFooter>
                    </div>

                    {/* Preview Panel */}
                    <div className="bg-muted/40 p-8 flex items-center justify-center">
                        <div
                            className="relative w-full aspect-square rounded-xl shadow-inner overflow-hidden transition-colors duration-300"
                            style={{ backgroundColor: bgColor }}
                        >
                            {imageSrc ? (
                                <img
                                    src={imageSrc}
                                    alt="Selected image preview"
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full transition-opacity duration-500 animate-in fade-in"
                                />
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
