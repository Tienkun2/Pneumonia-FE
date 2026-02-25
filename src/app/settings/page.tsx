import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cài đặt hệ thống</h1>
        <p className="text-muted-foreground">
          Quản lý cấu hình và tùy chọn hệ thống
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cấu hình chung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiUrl">API URL</Label>
            <Input
              id="apiUrl"
              defaultValue={process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeout">Timeout (giây)</Label>
            <Input id="timeout" type="number" defaultValue="30" />
          </div>
          <Button>Lưu thay đổi</Button>
        </CardContent>
      </Card>
    </div>
  );
}
