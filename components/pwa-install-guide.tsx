"use client";

import { useState } from "react";
import { Monitor, Globe, SmartphoneIcon, Apple } from "lucide-react";
import { Small } from "@/components/ui/typography";

interface PWAInstallGuideProps {
    isOpen: boolean;
}

export function PWAInstallGuide({ isOpen }: PWAInstallGuideProps) {
    const [expandedDevice, setExpandedDevice] = useState<string | null>(null);

    if (!isOpen) return null;

    const devices = [
        {
            id: "desktop",
            icon: Monitor,
            title: "Desktop",
            instructions: [
                "Click the install icon in the browser's address bar",
                "Click 'Install' in the popup that appears",
                "The app will be added to your desktop or Start menu"
            ]
        },
        {
            id: "mac-safari",
            icon: Apple,
            title: "Mac (Safari)",
            instructions: [
                "Open the page in Safari on macOS Sonoma or later",
                "Click 'File' in the menu bar",
                "Select 'Add to Dock'",
                "The app will appear in your Dock and Launchpad"
            ]
        },
        {
            id: "ios",
            icon: Globe,
            title: "iOS",
            instructions: [
                "Tap the Share button at the bottom of the screen",
                "Scroll down and tap 'Add to Home Screen'",
                "Tap 'Add' in the top right corner",
                "You'll find the app on your Home Screen"
            ]
        },
        {
            id: "android",
            icon: SmartphoneIcon,
            title: "Android",
            instructions: [
                "Tap the Menu button (⋮) in the top right",
                "Tap 'Add to Home Screen' or 'Install'",
                "Tap 'Add' or 'Install' when prompted",
                "The app will be available on your home screen"
            ]
        }
    ];

    const selected = devices.find((d) => d.id === expandedDevice);

    return (
        <div className="mt-3 pl-[52px] space-y-3 animate-in slide-in-from-bottom-2 duration-200">
            {/* Device selector — horizontal */}
            <div className="flex gap-2">
                {devices.map((device) => {
                    const Icon = device.icon;
                    const isSelected = expandedDevice === device.id;

                    return (
                        <button
                            key={device.id}
                            onClick={() => setExpandedDevice(isSelected ? null : device.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200
                                ${isSelected
                                    ? "bg-foreground/10 border-foreground/20 text-foreground"
                                    : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground/80 hover:bg-muted/40"
                                }`}
                        >
                            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                            {device.title}
                        </button>
                    );
                })}
            </div>

            {/* Instructions for selected device */}
            {selected && (
                <div className="rounded-lg border border-border/50 bg-muted/20 px-4 py-3.5 space-y-2 animate-in slide-in-from-top-1 duration-150">
                    {selected.instructions.map((instruction, index) => (
                        <div key={index} className="flex gap-2.5 items-start">
                            <span className="text-xs text-muted-foreground/50 font-mono mt-0.5 w-4 flex-shrink-0">
                                {index + 1}.
                            </span>
                            <Small className="text-muted-foreground leading-relaxed">
                                {instruction}
                            </Small>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}