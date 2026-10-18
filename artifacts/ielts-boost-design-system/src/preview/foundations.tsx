import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Guidelines } from './parts';

const CORE_SWATCHES = [
  { name: 'Asosiy rang', className: 'bg-primary' },
  { name: 'Yordamchi rang', className: 'bg-secondary' },
  { name: 'Urg‘u rangi', className: 'bg-accent' },
] as const;

const SUPPORTING_SWATCHES = [
  { name: 'Fon', className: 'border bg-background' },
  { name: 'Asosiy matn', className: 'bg-foreground' },
  { name: 'Yumshoq fon', className: 'bg-muted' },
  { name: 'Xato holati', className: 'bg-destructive' },
  { name: 'Chegara', className: 'bg-border' },
] as const;

const TYPE_SCALE = [
  { label: 'Katta sarlavha', className: 'text-4xl font-bold font-serif' },
  { label: 'Sarlavha', className: 'text-2xl font-semibold font-serif' },
  { label: 'Asosiy matn', className: 'text-base' },
  { label: 'Yorliq', className: 'text-sm font-medium' },
  { label: 'Qisqa izoh', className: 'text-sm text-muted-foreground' },
] as const;

const SPACING_SCALE = [
  { label: '4', className: 'w-4' },
  { label: '8', className: 'w-8' },
  { label: '12', className: 'w-12' },
  { label: '16', className: 'w-16' },
  { label: '24', className: 'w-24' },
] as const;

function Swatch({
  name,
  className,
}: {
  name: string;
  className: string;
}) {
  return (
    <div className="space-y-2">
      <div className={`h-16 rounded-lg ${className}`} />
      <p className="text-sm font-medium">{name}</p>
    </div>
  );
}

export function OverviewPage() {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border bg-card p-5 text-card-foreground">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Asosiy ranglar
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {CORE_SWATCHES.map((swatch) => (
            <Swatch key={swatch.name} {...swatch} />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5 text-card-foreground">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Matn uslubi
          </h2>
          <div className="mt-4 space-y-3">
            {TYPE_SCALE.map((entry) => (
              <p key={entry.label} className={entry.className}>
                {entry.label}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 text-card-foreground">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Namunada
          </h2>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Bugungi mashg‘ulot</CardTitle>
              <CardDescription>
                Navbatdagi IELTS mashqini reja asosida bajaring.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="overview-name">Mashg‘ulot nomi</Label>
                <Input id="overview-name" placeholder="Masalan: 2-passage" />
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked id="overview-notify" />
                <Label htmlFor="overview-notify">Eslatma taymeri</Label>
                <Badge className="ml-auto">Yangi</Badge>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button>Saqlash</Button>
              <Button variant="outline">Bekor qilish</Button>
            </CardFooter>
          </Card>
        </section>
      </div>

      <section className="space-y-4 rounded-xl border bg-card p-5 text-card-foreground">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Boshqaruv elementlari
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Asosiy</Button>
          <Button variant="secondary">Yordamchi</Button>
          <Button variant="outline">Chegarali</Button>
          <Button variant="ghost">Yengil</Button>
          <Badge>Holat</Badge>
          <Badge variant="secondary">Yordamchi</Badge>
          <Badge variant="outline">Chegarali</Badge>
        </div>
      </section>
    </div>
  );
}

export function ColorsPage() {
  return (
    <div className="space-y-8 rounded-xl border bg-card p-6 text-card-foreground">
      <section className="space-y-4">
        <div>
          <h2 className="font-semibold font-serif">Ranglar</h2>
          <p className="text-sm text-muted-foreground">
            Asosiy amal, yordamchi amal va muhim holatlarni ajratish uchun.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {CORE_SWATCHES.map((swatch) => (
            <Swatch key={swatch.name} {...swatch} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold font-serif">Fon va holat ranglari</h2>
          <p className="text-sm text-muted-foreground">
            Matn, fon, chegara va xato holatlari uchun ishlatiladi.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {SUPPORTING_SWATCHES.map((swatch) => (
            <Swatch key={swatch.name} {...swatch} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function FontsPage() {
  return (
    <div className="space-y-8 rounded-xl border bg-card p-6 text-card-foreground">
      <section>
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Shriftlar
        </h2>
        <p className="mt-4 text-4xl font-bold font-serif">IELTS Boost</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Sarlavhalarda Georgia, qolgan matnda qurilma tizim shriftidan foydalaniladi.
        </p>
      </section>

      <section className="space-y-4 border-t pt-6">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Matn o‘lchamlari
        </h2>
        {TYPE_SCALE.map((entry) => (
          <div key={entry.label} className="grid gap-2 sm:grid-cols-[88px_1fr]">
            <span className="pt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {entry.label}
            </span>
            <p className={entry.className}>Bugun kichik qadam, ertaga katta natija.</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export function LayoutPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border bg-card p-6 text-card-foreground">
        <h2 className="font-semibold font-serif">Oraliq</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Asosiy oraliq birligi 4 piksel; undan kengroq masofalar hosil qilinadi.
        </p>
        <div className="mt-6 space-y-4">
          {SPACING_SCALE.map((space) => (
            <div key={space.label} className="flex items-center gap-4">
              <span className="w-8 text-xs text-muted-foreground">
                {space.label}
              </span>
              <div className={`h-3 rounded-full bg-primary ${space.className}`} />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 text-card-foreground">
        <h2 className="font-semibold font-serif">Burchaklar</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kartochka burchaklari manbadagi 16 piksel o‘lchamga asoslangan.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {[
            { label: 'Kichik', className: 'rounded-sm' },
            { label: 'O‘rtacha', className: 'rounded-md' },
            { label: 'Katta', className: 'rounded-lg' },
            { label: 'Eng katta', className: 'rounded-xl' },
          ].map((radius) => (
            <div
              key={radius.label}
              className={`flex h-24 items-end border bg-muted p-3 ${radius.className}`}
            >
              <span className="text-xs font-medium">{radius.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function DesignGuidelinesPage() {
  return (
    <div className="space-y-5 rounded-xl border bg-card p-6 text-card-foreground">
      <div>
        <h2 className="font-semibold font-serif">Manbadan olingan qoidalar</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Biriktirilgan IELTS Boost HTML ko‘rinishida kuzatilgan qoidalar.
        </p>
      </div>
      <Guidelines
        items={[
          { kind: 'do', text: 'Muhim amallarni g‘isht rangida, muvaffaqiyat holatini yashil rangda ko‘rsating.' },
          { kind: 'do', text: 'Sarlavhalarda Georgia, asosiy matnda qurilmaning tizim sans-serif shriftidan foydalaning.' },
          { kind: 'do', text: 'Tegishli mashqlarni och rangli, chegarasi aniq va yumaloq burchakli kartochkalarda guruhlang.' },
        ]}
      />
    </div>
  );
}
