# Google Maps API Setup

## Google Maps API Key авах заавар

### 1. Google Cloud Console руу нэвтрэх

- [Google Cloud Console](https://console.cloud.google.com) хаягаар орно уу
- Google account-аар нэвтэрнэ үү

### 2. Төсөл үүсгэх эсвэл сонгох

- Дээд хэсгээс төслөө сонгох эсвэл шинээр үүсгэнэ
- "New Project" дарж шинэ төсөл үүсгэж болно

### 3. Google Maps API идэвхжүүлэх

- Navigation menu (☰) дээр дарна
- "APIs & Services" > "Library" сонгоно
- Хайлтаас "Maps JavaScript API" хайна
- "ENABLE" товч дарж идэвхжүүлнэ

### 4. API Key үүсгэх

- "APIs & Services" > "Credentials" орно
- "+ CREATE CREDENTIALS" > "API key" сонгоно
- API key үүсэх үед хуулж авна

### 5. API Key-г тохируулах (Заавал биш, гэхдээ зөвлөмж)

- Шинээр үүссэн API key дээр дарж тохиргоо хийнэ
- "Application restrictions" хэсэгт "HTTP referrers (web sites)" сонгоно
- Referrer нэмнэ: `http://localhost:3100/*`
- "API restrictions" хэсэгт "Restrict key" сонгож "Maps JavaScript API"-г сонгоно
- "SAVE" дарна

### 6. .env.local файлд API key оруулах

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

### 7. Апп-аа дахин ажиллуулах

```bash
npm run dev
```

## Анхаарах зүйл

⚠️ **Бүү нийтлэ**: API key-г GitHub эсвэл олон нийтэд нийтлэхгүй байх. `.env.local` файл `.gitignore` дотор байгаа эсэхийг шалгана уу.

⚠️ **Төлбөр**: Google Maps API үнэгүй хэмжээтэй боловч их хэрэглээ гарвал төлбөртэй болно. [Pricing](https://mapsplatform.google.com/pricing/) үзнэ үү.

⚠️ **Хязгаарлалт**: API key-д хязгаарлалт тавьж, зөвхөн өөрийн domain-ээс ашиглах боломжтой болгох нь аюулгүй.

## Ашигласан API-ууд

- **Maps JavaScript API**: Газрын зураг харуулах
- **Directions API**: Маршрут зурах (эхлэх ба очих цэг хоорондох зам)

## Дэмжлэг

Асуудал гарвал [Google Maps Platform Documentation](https://developers.google.com/maps/documentation/javascript) үзнэ үү.
