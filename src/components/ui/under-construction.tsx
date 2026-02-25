"use client";

import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function UnderConstruction() {
    const router = useRouter();

    return (
        <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                <Construction className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Tính năng đang phát triển
                </h2>
                <p className="max-w-[500px] text-muted-foreground">
                    Chức năng này đang được xây dựng và sẽ sớm ra mắt trong bản cập nhật tiếp theo.
                    Vui lòng quay lại sau!
                </p>
            </div>

            <Button onClick={() => router.back()} variant="outline" className="mt-4">
                Quay lại trang trước
            </Button>
        </div>
    );
}
