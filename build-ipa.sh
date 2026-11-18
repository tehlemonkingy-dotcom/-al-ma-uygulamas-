#!/usr/bin/env bash
###############################################################################
# LGS Asistanım – .ipa build script (macOS / Xcode)
#
# Bu script, Expo iOS projesini xcodebuild kullanarak imzalanmamış (unsigned)
# veya ad-hoc bir .ipa dosyası olarak ./output/LGS-Asistanim.ipa yolunda derler.
#
# Kullanım (macOS):
#   chmod +x build-ipa.sh
#   ./build-ipa.sh
#
# Windows/Linux kullanıcıları: kodu GitHub'a pushlayın,
# .github/workflows/build-ipa.yml otomatik olarak .ipa artifact'ı üretir.
#
# Gereksinimler (macOS):
#   - Xcode Command Line Tools (xcodebuild)
#   - node, npm, npx
###############################################################################
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/output"
IPA_NAME="LGS-Asistanim.ipa"
IPA_PATH="$OUTPUT_DIR/$IPA_NAME"
IOS_DIR="$PROJECT_ROOT/ios"
BUILD_DIR="$PROJECT_ROOT/ios-build"

echo "============================================================"
echo "  LGS Asistanım - .ipa Derleme Başlatılıyor"
echo "  Çıkış: $IPA_PATH"
echo "============================================================"

# 1. macOS kontrolü
if [[ "$(uname)" != "Darwin" ]]; then
  echo "HATA: Bu script sadece macOS'ta çalışabilir (xcodebuild gereklidir)."
  echo "      Windows/Linux kullanıcıları .github/workflows/build-ipa.yml üzerinden derleyebilir."
  exit 1
fi

# 2. Xcode / xcodebuild kontrolü
if ! command -v xcodebuild &>/dev/null; then
  echo "HATA: xcodebuild bulunamadı. Xcode Command Line Tools'u yükleyin:"
  echo "      xcode-select --install"
  exit 1
fi

# 3. node / npm kontrolü
if ! command -v node &>/dev/null; then
  echo "HATA: node bulunamadı. Node.js'i yükleyin."
  exit 1
fi

# 4. node_modules kontrolü
if [[ ! -d "$PROJECT_ROOT/node_modules" ]]; then
  echo "node_modules bulunamadı. npm install çalıştırılıyor..."
  cd "$PROJECT_ROOT"
  npm install
fi

# 5. Eğer iOS klasörü yoksa, expo prebuild ile oluştur (macOS'ta çalışır)
if [[ ! -d "$IOS_DIR" ]]; then
  echo "iOS native klasörü bulunamadı. expo prebuild çalıştırılıyor..."
  cd "$PROJECT_ROOT"
  npx expo prebuild --platform ios --non-interactive || {
    echo "HATA: expo prebuild başarısız oldu."
    exit 1
  }
fi

# 6. Eski build dosyalarını temizle
rm -rf "$BUILD_DIR" "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# 7. Xcode workspace / proje dosyasını otomatik bul
WORKSPACE_PATH=$(find "$IOS_DIR" -maxdepth 1 -name "*.xcworkspace" -print -quit 2>/dev/null || true)
PROJECT_PATH=$(find "$IOS_DIR" -maxdepth 1 -name "*.xcodeproj" -print -quit 2>/dev/null || true)

BUILD_TARGET=""
SCHEME_NAME=""

if [[ -n "$WORKSPACE_PATH" ]]; then
  # Scheme'i projedeki listeden otomatik al
  cd "$IOS_DIR"
  SCHEME_NAME=$(xcodebuild -workspace "$(basename "$WORKSPACE_PATH")" -list 2>/dev/null | grep -A 30 "Schemes:" | grep -oE '[A-Za-z0-9 _.-]+' | head -n 1 | xargs || true)
  if [[ -z "$SCHEME_NAME" ]]; then
    SCHEME_NAME="$(basename "$WORKSPACE_PATH" .xcworkspace)"
  fi
  BUILD_TARGET="-workspace \"$WORKSPACE_PATH\" -scheme \"$SCHEME_NAME\""
  echo "Bulunan workspace: $WORKSPACE_PATH (scheme: $SCHEME_NAME)"
elif [[ -n "$PROJECT_PATH" ]]; then
  cd "$IOS_DIR"
  SCHEME_NAME=$(xcodebuild -project "$(basename "$PROJECT_PATH")" -list 2>/dev/null | grep -A 30 "Schemes:" | grep -oE '[A-Za-z0-9 _.-]+' | head -n 1 | xargs || true)
  if [[ -z "$SCHEME_NAME" ]]; then
    SCHEME_NAME="$(basename "$PROJECT_PATH" .xcodeproj)"
  fi
  BUILD_TARGET="-project \"$PROJECT_PATH\" -scheme \"$SCHEME_NAME\""
  echo "Bulunan proje: $PROJECT_PATH (scheme: $SCHEME_NAME)"
else
  echo "HATA: Xcode workspace veya projesi bulunamadı ($IOS_DIR)."
  echo "      Önce 'npx expo prebuild --platform ios' çalıştırın."
  exit 1
fi

# 8. Release derlemesi (unsigned / ad-hoc .ipa)
echo "xcodebuild ile archive oluşturuluyor (bu işlem birkaç dakika sürebilir)..."
cd "$IOS_DIR"

# shellcheck disable=SC2086
xcodebuild $BUILD_TARGET \
  -configuration Release \
  -sdk iphoneos \
  -archivePath "$BUILD_DIR/LGS-Asistanim.xcarchive" \
  archive \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO \
  PROVISIONING_PROFILE="" \
  || {
    echo "HATA: xcodebuild archive başarısız oldu."
    exit 1
  }

# 9. .ipa dosyasını export et (ad-hoc / unsigned)
echo ".ipa dosyası export ediliyor..."

# Export options plist oluştur (unsigned/ad-hoc)
cat > "$BUILD_DIR/ExportOptions.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>ad-hoc</string>
  <key>signingCertificate</key>
  <string></string>
  <key>signingStyle</key>
  <string>Automatic</string>
  <key>stripSwiftSymbols</key>
  <true/>
  <key>teamID</key>
  <string></string>
  <key>thinning</key>
  <string><thin-for-all-variants></string>
</dict>
</plist>
PLIST

xcodebuild -exportArchive \
  -archivePath "$BUILD_DIR/LGS-Asistanim.xcarchive" \
  -exportPath "$BUILD_DIR/export" \
  -exportOptionsPlist "$BUILD_DIR/ExportOptions.plist" \
  || {
    echo "HATA: xcodebuild exportArchive başarısız oldu."
    exit 1
  }

# 10. .ipa dosyasını output klasörüne kopyala
EXPORTED_IPA=$(find "$BUILD_DIR/export" -name "*.ipa" | head -n 1 || true)

if [[ -z "$EXPORTED_IPA" ]]; then
  echo "HATA: .ipa dosyası export klasöründe bulunamadı."
  exit 1
fi

cp "$EXPORTED_IPA" "$IPA_PATH"

echo ""
echo "============================================================"
echo "  BAŞARILI! .ipa dosyası oluşturuldu:"
echo "  $IPA_PATH"
echo "============================================================"

# Dosya boyutu
if [[ -f "$IPA_PATH" ]]; then
  SIZE=$(du -h "$IPA_PATH" | cut -f1)
  echo "  Boyut: $SIZE"
fi

echo ""
echo "Not: Bu .ipa imzalanmamış (unsigned)dir. Gerçek bir cihaza yüklemek"
echo "için Apple Developer hesabıyla imzalanmış bir provisioning profile gereklidir."