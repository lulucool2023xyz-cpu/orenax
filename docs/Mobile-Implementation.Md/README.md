# Mobile Flutter Implementation Guide

Complete Dart/Flutter implementation guide for integrating with OrenaX Backend API.

## 📋 Table of Contents

| Folder | Description |
|--------|-------------|
| [Auth-Spek-API/](./Auth-Spek-API/) | Authentication (login, register, OAuth, tokens) |
| [000-Fix-api/](./000-Fix-api/) | API V2 (Gemini API) implementation |
| [111-Fix-api/](./111-Fix-api/) | API V1 (Vertex AI) implementation |

---

## Quick Start

### 1. Add Dependencies

```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  flutter_secure_storage: ^9.0.0
  google_sign_in: ^6.1.5
  flutter_facebook_auth: ^6.0.0
  provider: ^6.1.1
```

### 2. Configure Base URL

```dart
// lib/core/config/api_config.dart
class ApiConfig {
  static const String baseUrl = 'https://your-backend.com';
  static const String apiV1 = '$baseUrl/api/v1';
  static const String apiV2 = '$baseUrl/api/v2';
  static const String auth = '$baseUrl/auth';
}
```

### 3. Setup HTTP Client

```dart
// lib/core/services/http_service.dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class HttpService {
  final http.Client _client = http.Client();
  String? _accessToken;

  void setToken(String token) {
    _accessToken = token;
  }

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_accessToken != null) 'Authorization': 'Bearer $_accessToken',
  };

  Future<Map<String, dynamic>> post(String url, Map<String, dynamic> body) async {
    final response = await _client.post(
      Uri.parse(url),
      headers: _headers,
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> get(String url) async {
    final response = await _client.get(Uri.parse(url), headers: _headers);
    return _handleResponse(response);
  }

  Map<String, dynamic> _handleResponse(http.Response response) {
    final data = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    }
    throw ApiException(data['message'] ?? 'Request failed', response.statusCode);
  }
}

class ApiException implements Exception {
  final String message;
  final int statusCode;
  ApiException(this.message, this.statusCode);
}
```

---

## Architecture

```
lib/
├── core/
│   ├── config/
│   │   └── api_config.dart
│   ├── services/
│   │   ├── http_service.dart
│   │   └── storage_service.dart
│   └── models/
│       └── api_response.dart
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── auth_api.dart
│   │   │   └── auth_repository.dart
│   │   ├── models/
│   │   │   └── user_model.dart
│   │   └── providers/
│   │       └── auth_provider.dart
│   ├── chat/
│   │   ├── data/
│   │   │   └── chat_api.dart
│   │   └── models/
│   │       └── chat_message.dart
│   ├── image/
│   ├── video/
│   ├── music/
│   └── tts/
└── main.dart
```

---

## Documentation Structure

### Auth-Spek-API/
- Complete auth flow (email, OAuth)
- Token management
- Session handling
- Provider setup

### 000-Fix-api/ (V2)
- Chat streaming (SSE)
- Image generation (Gemini)
- Video generation (Veo)
- Music generation (Lyria RealTime)
- TTS (Gemini TTS)

### 111-Fix-api/ (V1)
- Chat with thinking mode
- Image generation (Imagen)
- Video generation (Veo via Vertex)
- Music generation (Lyria-002)
- TTS (Google Cloud TTS)
