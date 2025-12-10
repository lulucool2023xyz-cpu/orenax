# API V1 Flutter Implementation (Vertex AI)

Complete Dart/Flutter implementation for API V1 endpoints (Vertex AI backend).

## Endpoints Overview

| Category | Endpoints |
|----------|-----------|
| Chat | `/chat` |
| Image | `/image/text-to-image`, `/image/image-upscale`, `/image/gemini-generate` |
| Video | `/video/text-to-video`, `/video/image-to-video`, `/video/extend` |
| Music | `/music/generate` |
| TTS | `/audio/tts/single`, `/audio/tts/multi` |

---

## Base Configuration

```dart
// lib/core/config/api_v1_config.dart
class ApiV1Config {
  static const String baseUrl = 'https://your-backend.com/api/v1';
  
  static String get chat => '$baseUrl/chat';
  static String get image => '$baseUrl/image';
  static String get video => '$baseUrl/video';
  static String get music => '$baseUrl/music';
  static String get tts => '$baseUrl/audio/tts';
}
```

---

## Chat Service (V1)

```dart
// lib/features/chat/data/chat_api_v1.dart
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;

class ChatApiV1 {
  final String _baseUrl;
  final String _accessToken;
  final http.Client _client;

  ChatApiV1({required String baseUrl, required String accessToken, http.Client? client})
      : _baseUrl = baseUrl, _accessToken = accessToken, _client = client ?? http.Client();

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $_accessToken',
  };

  /// Chat with optional streaming
  Future<ChatResponseV1> chat(ChatRequestV1 request) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/chat'),
      headers: _headers,
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode == 200) {
      return ChatResponseV1.fromJson(jsonDecode(response.body));
    }
    throw ApiException(jsonDecode(response.body)['message'] ?? 'Chat failed', response.statusCode);
  }

  /// Streaming chat with SSE
  Stream<ChatStreamChunkV1> streamChat(ChatRequestV1 request) async* {
    final req = http.Request('POST', Uri.parse('$_baseUrl/chat'));
    req.headers.addAll(_headers);
    req.body = jsonEncode(request.toJson()..['stream'] = true);

    final streamedResponse = await _client.send(req);
    
    await for (final chunk in streamedResponse.stream.transform(utf8.decoder)) {
      for (final line in chunk.split('\n')) {
        if (line.startsWith('data: ')) {
          final data = line.substring(6);
          if (data == '[DONE]') return;
          try {
            yield ChatStreamChunkV1.fromJson(jsonDecode(data));
          } catch (_) {}
        }
      }
    }
  }

  /// Count tokens
  Future<TokenCount> countTokens(List<ChatMessageV1> messages, {String? model}) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/chat/count-tokens'),
      headers: _headers,
      body: jsonEncode({
        'messages': messages.map((m) => m.toJson()).toList(),
        if (model != null) 'model': model,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return TokenCount(
        totalTokens: data['totalTokens'],
        model: data['model'],
      );
    }
    throw ApiException('Failed to count tokens', response.statusCode);
  }
}

class ChatRequestV1 {
  final String? prompt;
  final List<ChatMessageV1>? messages;
  final String? model;
  final bool? stream;
  final ThinkingConfigV1? thinkingConfig;
  final GroundingConfigV1? groundingConfig;
  final GenerationConfigV1? generationConfig;

  ChatRequestV1({
    this.prompt,
    this.messages,
    this.model,
    this.stream,
    this.thinkingConfig,
    this.groundingConfig,
    this.generationConfig,
  });

  Map<String, dynamic> toJson() => {
    if (prompt != null) 'prompt': prompt,
    if (messages != null) 'messages': messages!.map((m) => m.toJson()).toList(),
    if (model != null) 'model': model,
    if (stream != null) 'stream': stream,
    if (thinkingConfig != null) 'thinkingConfig': thinkingConfig!.toJson(),
    if (groundingConfig != null) 'groundingConfig': groundingConfig!.toJson(),
    if (generationConfig != null) 'generationConfig': generationConfig!.toJson(),
  };
}

class ChatMessageV1 {
  final String role;
  final String content;

  ChatMessageV1({required this.role, required this.content});

  Map<String, dynamic> toJson() => {'role': role, 'content': content};
  
  factory ChatMessageV1.fromJson(Map<String, dynamic> json) {
    return ChatMessageV1(role: json['role'], content: json['content']);
  }
}

class ThinkingConfigV1 {
  final int? thinkingBudget;
  final String? thinkingLevel; // For Gemini 3
  final bool? includeThoughts;

  ThinkingConfigV1({this.thinkingBudget, this.thinkingLevel, this.includeThoughts});

  Map<String, dynamic> toJson() => {
    if (thinkingBudget != null) 'thinkingBudget': thinkingBudget,
    if (thinkingLevel != null) 'thinkingLevel': thinkingLevel,
    if (includeThoughts != null) 'includeThoughts': includeThoughts,
  };
}

class GroundingConfigV1 {
  final bool googleSearch;
  final UrlContextV1? urlContext;

  GroundingConfigV1({this.googleSearch = false, this.urlContext});

  Map<String, dynamic> toJson() => {
    'googleSearch': googleSearch,
    if (urlContext != null) 'urlContext': urlContext!.toJson(),
  };
}

class UrlContextV1 {
  final bool enabled;
  final List<String>? urls;

  UrlContextV1({this.enabled = false, this.urls});

  Map<String, dynamic> toJson() => {
    'enabled': enabled,
    if (urls != null) 'urls': urls,
  };
}

class GenerationConfigV1 {
  final double? temperature;
  final double? topP;
  final int? topK;
  final int? maxOutputTokens;

  GenerationConfigV1({this.temperature, this.topP, this.topK, this.maxOutputTokens});

  Map<String, dynamic> toJson() => {
    if (temperature != null) 'temperature': temperature,
    if (topP != null) 'topP': topP,
    if (topK != null) 'topK': topK,
    if (maxOutputTokens != null) 'maxOutputTokens': maxOutputTokens,
  };
}

class ChatResponseV1 {
  final ChatMessageV1 message;
  final UsageMetadataV1? usageMetadata;
  final String? conversationId;
  final List<String>? thoughts;
  final GroundingMetadataV1? groundingMetadata;

  ChatResponseV1({
    required this.message,
    this.usageMetadata,
    this.conversationId,
    this.thoughts,
    this.groundingMetadata,
  });

  factory ChatResponseV1.fromJson(Map<String, dynamic> json) {
    return ChatResponseV1(
      message: ChatMessageV1.fromJson(json['message']),
      usageMetadata: json['usageMetadata'] != null
          ? UsageMetadataV1.fromJson(json['usageMetadata'])
          : null,
      conversationId: json['conversationId'],
      thoughts: (json['thoughts'] as List?)?.cast<String>(),
      groundingMetadata: json['groundingMetadata'] != null
          ? GroundingMetadataV1.fromJson(json['groundingMetadata'])
          : null,
    );
  }
}

class ChatStreamChunkV1 {
  final String? content;
  final bool done;
  final UsageMetadataV1? usageMetadata;

  ChatStreamChunkV1({this.content, required this.done, this.usageMetadata});

  factory ChatStreamChunkV1.fromJson(Map<String, dynamic> json) {
    return ChatStreamChunkV1(
      content: json['content'],
      done: json['done'] ?? false,
      usageMetadata: json['usageMetadata'] != null
          ? UsageMetadataV1.fromJson(json['usageMetadata'])
          : null,
    );
  }
}

class UsageMetadataV1 {
  final int promptTokenCount;
  final int candidatesTokenCount;
  final int totalTokenCount;

  UsageMetadataV1({
    required this.promptTokenCount,
    required this.candidatesTokenCount,
    required this.totalTokenCount,
  });

  factory UsageMetadataV1.fromJson(Map<String, dynamic> json) {
    return UsageMetadataV1(
      promptTokenCount: json['promptTokenCount'] ?? 0,
      candidatesTokenCount: json['candidatesTokenCount'] ?? 0,
      totalTokenCount: json['totalTokenCount'] ?? 0,
    );
  }
}

class GroundingMetadataV1 {
  final List<String>? webSearchQueries;
  final List<GroundingChunkV1>? groundingChunks;

  GroundingMetadataV1({this.webSearchQueries, this.groundingChunks});

  factory GroundingMetadataV1.fromJson(Map<String, dynamic> json) {
    return GroundingMetadataV1(
      webSearchQueries: (json['webSearchQueries'] as List?)?.cast<String>(),
      groundingChunks: (json['groundingChunks'] as List?)
          ?.map((c) => GroundingChunkV1.fromJson(c))
          .toList(),
    );
  }
}

class GroundingChunkV1 {
  final String? uri;
  final String? title;

  GroundingChunkV1({this.uri, this.title});

  factory GroundingChunkV1.fromJson(Map<String, dynamic> json) {
    final web = json['web'];
    return GroundingChunkV1(uri: web?['uri'], title: web?['title']);
  }
}

class TokenCount {
  final int totalTokens;
  final String model;

  TokenCount({required this.totalTokens, required this.model});
}

class ApiException implements Exception {
  final String message;
  final int statusCode;
  ApiException(this.message, this.statusCode);
}
```

---

## Image Generation (V1)

```dart
// lib/features/image/data/image_api_v1.dart
class ImageApiV1 {
  final String _baseUrl;
  final String _accessToken;
  final http.Client _client;

  ImageApiV1({required String baseUrl, required String accessToken, http.Client? client})
      : _baseUrl = baseUrl, _accessToken = accessToken, _client = client ?? http.Client();

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $_accessToken',
  };

  /// Text-to-Image (Imagen)
  Future<ImageResponseV1> textToImage(TextToImageRequestV1 request) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/image/text-to-image'),
      headers: _headers,
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode == 200) {
      return ImageResponseV1.fromJson(jsonDecode(response.body));
    }
    throw ApiException(jsonDecode(response.body)['message'], response.statusCode);
  }

  /// Image upscale
  Future<ImageResponseV1> upscale(ImageUpscaleRequestV1 request) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/image/image-upscale'),
      headers: _headers,
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode == 200) {
      return ImageResponseV1.fromJson(jsonDecode(response.body));
    }
    throw ApiException(jsonDecode(response.body)['message'], response.statusCode);
  }

  /// Gemini image generation
  Future<ImageResponseV1> geminiGenerate(GeminiImageRequestV1 request) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/image/gemini-generate'),
      headers: _headers,
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode == 200) {
      return ImageResponseV1.fromJson(jsonDecode(response.body));
    }
    throw ApiException(jsonDecode(response.body)['message'], response.statusCode);
  }
}

class TextToImageRequestV1 {
  final String prompt;
  final String? model;
  final int? sampleCount;
  final String? negativePrompt;
  final String? aspectRatio;
  final bool? enhancePrompt;

  TextToImageRequestV1({
    required this.prompt,
    this.model,
    this.sampleCount,
    this.negativePrompt,
    this.aspectRatio,
    this.enhancePrompt,
  });

  Map<String, dynamic> toJson() => {
    'prompt': prompt,
    if (model != null) 'model': model,
    if (sampleCount != null) 'sampleCount': sampleCount,
    if (negativePrompt != null) 'negativePrompt': negativePrompt,
    if (aspectRatio != null) 'aspectRatio': aspectRatio,
    if (enhancePrompt != null) 'enhancePrompt': enhancePrompt,
  };
}

class ImageUpscaleRequestV1 {
  final String imageBase64;
  final String? upscaleFactor;

  ImageUpscaleRequestV1({required this.imageBase64, this.upscaleFactor});

  Map<String, dynamic> toJson() => {
    'image': imageBase64,
    if (upscaleFactor != null) 'upscaleFactor': upscaleFactor,
  };
}

class GeminiImageRequestV1 {
  final String prompt;
  final String? model;
  final String? aspectRatio;

  GeminiImageRequestV1({required this.prompt, this.model, this.aspectRatio});

  Map<String, dynamic> toJson() => {
    'prompt': prompt,
    if (model != null) 'model': model,
    if (aspectRatio != null) 'aspectRatio': aspectRatio,
  };
}

class ImageResponseV1 {
  final bool success;
  final String model;
  final List<GeneratedImageV1> images;

  ImageResponseV1({required this.success, required this.model, required this.images});

  factory ImageResponseV1.fromJson(Map<String, dynamic> json) {
    return ImageResponseV1(
      success: json['success'] ?? false,
      model: json['model'] ?? '',
      images: (json['images'] as List?)
          ?.map((i) => GeneratedImageV1.fromJson(i))
          .toList() ?? [],
    );
  }
}

class GeneratedImageV1 {
  final String url;
  final String? gcsUri;
  final String? filename;
  final String? mimeType;

  GeneratedImageV1({required this.url, this.gcsUri, this.filename, this.mimeType});

  factory GeneratedImageV1.fromJson(Map<String, dynamic> json) {
    return GeneratedImageV1(
      url: json['url'] ?? '',
      gcsUri: json['gcsUri'],
      filename: json['filename'],
      mimeType: json['mimeType'],
    );
  }
}
```

---

## Video Generation (V1)

```dart
// lib/features/video/data/video_api_v1.dart
class VideoApiV1 {
  final String _baseUrl;
  final String _accessToken;
  final http.Client _client;

  VideoApiV1({required String baseUrl, required String accessToken, http.Client? client})
      : _baseUrl = baseUrl, _accessToken = accessToken, _client = client ?? http.Client();

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $_accessToken',
  };

  /// Text-to-Video
  Future<VideoResponseV1> textToVideo(TextToVideoRequestV1 request) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/video/text-to-video'),
      headers: _headers,
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode == 200) {
      return VideoResponseV1.fromJson(jsonDecode(response.body));
    }
    throw ApiException(jsonDecode(response.body)['message'], response.statusCode);
  }

  /// Check operation status
  Future<VideoOperationStatus> getOperationStatus(String operationId) async {
    final response = await _client.get(
      Uri.parse('$_baseUrl/video/operation?id=$operationId'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      return VideoOperationStatus.fromJson(jsonDecode(response.body));
    }
    throw ApiException('Failed to get status', response.statusCode);
  }
}

class TextToVideoRequestV1 {
  final String prompt;
  final String? model;
  final String? negativePrompt;
  final String? aspectRatio;
  final int? durationSeconds;
  final String? resolution;
  final bool? generateAudio;

  TextToVideoRequestV1({
    required this.prompt,
    this.model,
    this.negativePrompt,
    this.aspectRatio,
    this.durationSeconds,
    this.resolution,
    this.generateAudio,
  });

  Map<String, dynamic> toJson() => {
    'prompt': prompt,
    if (model != null) 'model': model,
    if (negativePrompt != null) 'negativePrompt': negativePrompt,
    if (aspectRatio != null) 'aspectRatio': aspectRatio,
    if (durationSeconds != null) 'durationSeconds': durationSeconds,
    if (resolution != null) 'resolution': resolution,
    if (generateAudio != null) 'generateAudio': generateAudio,
  };
}

class VideoResponseV1 {
  final bool success;
  final String url;
  final String? gcsUri;
  final String? filename;
  final String model;
  final int duration;
  final String aspectRatio;
  final bool hasAudio;
  final String? operationId;

  VideoResponseV1({
    required this.success,
    required this.url,
    this.gcsUri,
    this.filename,
    required this.model,
    required this.duration,
    required this.aspectRatio,
    required this.hasAudio,
    this.operationId,
  });

  factory VideoResponseV1.fromJson(Map<String, dynamic> json) {
    return VideoResponseV1(
      success: json['success'] ?? false,
      url: json['url'] ?? '',
      gcsUri: json['gcsUri'],
      filename: json['filename'],
      model: json['model'] ?? '',
      duration: json['duration'] ?? 8,
      aspectRatio: json['aspectRatio'] ?? '16:9',
      hasAudio: json['hasAudio'] ?? false,
      operationId: json['operationId'],
    );
  }
}

class VideoOperationStatus {
  final String operationId;
  final String status; // RUNNING, COMPLETED, FAILED
  final int? progress;
  final VideoResponseV1? result;
  final String? error;

  VideoOperationStatus({
    required this.operationId,
    required this.status,
    this.progress,
    this.result,
    this.error,
  });

  factory VideoOperationStatus.fromJson(Map<String, dynamic> json) {
    return VideoOperationStatus(
      operationId: json['operationId'] ?? '',
      status: json['status'] ?? 'RUNNING',
      progress: json['progress'],
      result: json['result'] != null ? VideoResponseV1.fromJson(json['result']) : null,
      error: json['error'],
    );
  }
}
```

---

## Music Generation (V1 - Lyria-002)

```dart
// lib/features/music/data/music_api_v1.dart
class MusicApiV1 {
  final String _baseUrl;
  final String _accessToken;
  final http.Client _client;

  MusicApiV1({required String baseUrl, required String accessToken, http.Client? client})
      : _baseUrl = baseUrl, _accessToken = accessToken, _client = client ?? http.Client();

  Future<MusicResponseV1> generate(MusicRequestV1 request) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/music/generate'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_accessToken',
      },
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode == 200) {
      return MusicResponseV1.fromJson(jsonDecode(response.body));
    }
    throw ApiException(jsonDecode(response.body)['message'], response.statusCode);
  }
}

class MusicRequestV1 {
  final String prompt;
  final String? negativePrompt;
  final int? seed;
  final int? sampleCount;

  MusicRequestV1({
    required this.prompt,
    this.negativePrompt,
    this.seed,
    this.sampleCount,
  });

  Map<String, dynamic> toJson() => {
    'prompt': prompt,
    if (negativePrompt != null) 'negativePrompt': negativePrompt,
    if (seed != null) 'seed': seed,
    if (sampleCount != null) 'sampleCount': sampleCount,
  };
}

class MusicResponseV1 {
  final bool success;
  final List<MusicTrackV1> tracks;
  final String model;
  final String generatedAt;

  MusicResponseV1({
    required this.success,
    required this.tracks,
    required this.model,
    required this.generatedAt,
  });

  factory MusicResponseV1.fromJson(Map<String, dynamic> json) {
    return MusicResponseV1(
      success: json['success'] ?? false,
      tracks: (json['tracks'] as List?)
          ?.map((t) => MusicTrackV1.fromJson(t))
          .toList() ?? [],
      model: json['model'] ?? 'lyria-002',
      generatedAt: json['generatedAt'] ?? '',
    );
  }
}

class MusicTrackV1 {
  final String url;
  final String? gcsUri;
  final String? filename;
  final String mimeType;
  final double duration;
  final int sampleRate;

  MusicTrackV1({
    required this.url,
    this.gcsUri,
    this.filename,
    required this.mimeType,
    required this.duration,
    required this.sampleRate,
  });

  factory MusicTrackV1.fromJson(Map<String, dynamic> json) {
    return MusicTrackV1(
      url: json['url'] ?? '',
      gcsUri: json['gcsUri'],
      filename: json['filename'],
      mimeType: json['mimeType'] ?? 'audio/wav',
      duration: (json['duration'] ?? 32.8).toDouble(),
      sampleRate: json['sampleRate'] ?? 48000,
    );
  }
}
```

---

## TTS (V1 - Google Cloud TTS)

```dart
// lib/features/tts/data/tts_api_v1.dart
class TtsApiV1 {
  final String _baseUrl;
  final String _accessToken;
  final http.Client _client;

  TtsApiV1({required String baseUrl, required String accessToken, http.Client? client})
      : _baseUrl = baseUrl, _accessToken = accessToken, _client = client ?? http.Client();

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $_accessToken',
  };

  /// Single speaker TTS
  Future<TtsResponseV1> synthesizeSingle(SingleTtsRequestV1 request) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/audio/tts/single'),
      headers: _headers,
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode == 200) {
      return TtsResponseV1.fromJson(jsonDecode(response.body));
    }
    throw ApiException(jsonDecode(response.body)['message'], response.statusCode);
  }

  /// Multi-speaker TTS
  Future<TtsResponseV1> synthesizeMulti(MultiTtsRequestV1 request) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/audio/tts/multi'),
      headers: _headers,
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode == 200) {
      return TtsResponseV1.fromJson(jsonDecode(response.body));
    }
    throw ApiException(jsonDecode(response.body)['message'], response.statusCode);
  }

  /// Get voices
  Future<List<VoiceInfoV1>> getVoices() async {
    final response = await _client.get(
      Uri.parse('$_baseUrl/audio/tts/voices'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return (data['voices'] as List)
          .map((v) => VoiceInfoV1.fromJson(v))
          .toList();
    }
    throw ApiException('Failed to get voices', response.statusCode);
  }
}

class SingleTtsRequestV1 {
  final String text;
  final String? voiceName;
  final String? languageCode;
  final double? speakingRate;
  final double? pitch;
  final double? volumeGainDb;

  SingleTtsRequestV1({
    required this.text,
    this.voiceName,
    this.languageCode,
    this.speakingRate,
    this.pitch,
    this.volumeGainDb,
  });

  Map<String, dynamic> toJson() => {
    'text': text,
    if (voiceName != null) 'voiceName': voiceName,
    if (languageCode != null) 'languageCode': languageCode,
    if (speakingRate != null) 'speakingRate': speakingRate,
    if (pitch != null) 'pitch': pitch,
    if (volumeGainDb != null) 'volumeGainDb': volumeGainDb,
  };
}

class MultiTtsRequestV1 {
  final String text;
  final List<SpeakerConfigV1> speakerConfigs;
  final String? languageCode;
  final double? speakingRate;

  MultiTtsRequestV1({
    required this.text,
    required this.speakerConfigs,
    this.languageCode,
    this.speakingRate,
  });

  Map<String, dynamic> toJson() => {
    'text': text,
    'speakerConfigs': speakerConfigs.map((s) => s.toJson()).toList(),
    if (languageCode != null) 'languageCode': languageCode,
    if (speakingRate != null) 'speakingRate': speakingRate,
  };
}

class SpeakerConfigV1 {
  final String speakerName;
  final String voiceName;

  SpeakerConfigV1({required this.speakerName, required this.voiceName});

  Map<String, dynamic> toJson() => {
    'speakerName': speakerName,
    'voiceName': voiceName,
  };
}

class TtsResponseV1 {
  final bool success;
  final String url;
  final String? gcsUri;
  final String? filename;
  final String mimeType;
  final String voiceName;
  final int speakerCount;

  TtsResponseV1({
    required this.success,
    required this.url,
    this.gcsUri,
    this.filename,
    required this.mimeType,
    required this.voiceName,
    required this.speakerCount,
  });

  factory TtsResponseV1.fromJson(Map<String, dynamic> json) {
    return TtsResponseV1(
      success: json['success'] ?? false,
      url: json['url'] ?? '',
      gcsUri: json['gcsUri'],
      filename: json['filename'],
      mimeType: json['mimeType'] ?? 'audio/mpeg',
      voiceName: json['voiceName'] ?? '',
      speakerCount: json['speakerCount'] ?? 1,
    );
  }
}

class VoiceInfoV1 {
  final String name;
  final List<String> languageCodes;
  final String ssmlGender;

  VoiceInfoV1({required this.name, required this.languageCodes, required this.ssmlGender});

  factory VoiceInfoV1.fromJson(Map<String, dynamic> json) {
    return VoiceInfoV1(
      name: json['name'] ?? '',
      languageCodes: (json['languageCodes'] as List?)?.cast<String>() ?? [],
      ssmlGender: json['ssmlGender'] ?? 'NEUTRAL',
    );
  }
}
```

---

## V1 vs V2 Comparison

| Feature | V1 | V2 |
|---------|-----|-----|
| Backend | Vertex AI SDK | Gemini API |
| Music Model | Lyria-002 (32.8s) | Lyria RealTime |
| TTS | Cloud TTS (MP3) | Gemini TTS (WAV) |
| Streaming | Simulated chunking | Native SSE |
| Video polling | Manual operation check | Async wait |
