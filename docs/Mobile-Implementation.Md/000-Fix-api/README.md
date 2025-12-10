# API V2 Flutter Implementation (Gemini API)

Complete Dart/Flutter implementation for API V2 endpoints.

## Endpoints Overview

| Category | Endpoints |
|----------|-----------|
| Chat | `/chat`, `/chat/stream` |
| Image | `/image/generate` |
| Video | `/video/generate`, `/video/image-to-video`, `/video/extend` |
| Music | `/music/generate` |
| TTS | `/tts/single`, `/tts/multi`, `/tts/voices` |

---

## Base Configuration

```dart
// lib/core/config/api_v2_config.dart
class ApiV2Config {
  static const String baseUrl = 'https://your-backend.com/api/v2';
  
  static String get chat => '$baseUrl/chat';
  static String get chatStream => '$baseUrl/chat/stream';
  static String get image => '$baseUrl/image/generate';
  static String get video => '$baseUrl/video/generate';
  static String get music => '$baseUrl/music/generate';
  static String get ttsSingle => '$baseUrl/tts/single';
  static String get ttsMulti => '$baseUrl/tts/multi';
  static String get ttsVoices => '$baseUrl/tts/voices';
}
```

---

## Chat Service (with Streaming)

```dart
// lib/features/chat/data/chat_api_v2.dart
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;

class ChatApiV2 {
  final String _baseUrl;
  final String _accessToken;
  final http.Client _client;

  ChatApiV2({
    required String baseUrl,
    required String accessToken,
    http.Client? client,
  }) : _baseUrl = baseUrl,
       _accessToken = accessToken,
       _client = client ?? http.Client();

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $_accessToken',
  };

  /// Non-streaming chat
  Future<ChatResponse> chat(ChatRequest request) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/chat'),
      headers: _headers,
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode == 200) {
      return ChatResponse.fromJson(jsonDecode(response.body));
    }
    throw _handleError(response);
  }

  /// Streaming chat using SSE
  Stream<ChatStreamChunk> streamChat(ChatRequest request) async* {
    final req = http.Request('POST', Uri.parse('$_baseUrl/chat/stream'));
    req.headers.addAll(_headers);
    req.body = jsonEncode(request.toJson()..['stream'] = true);

    final streamedResponse = await _client.send(req);
    
    await for (final chunk in streamedResponse.stream.transform(utf8.decoder)) {
      final lines = chunk.split('\n');
      for (final line in lines) {
        if (line.startsWith('data: ')) {
          final data = line.substring(6);
          if (data == '[DONE]') {
            return;
          }
          try {
            yield ChatStreamChunk.fromJson(jsonDecode(data));
          } catch (_) {}
        }
      }
    }
  }

  Exception _handleError(http.Response response) {
    final data = jsonDecode(response.body);
    return ApiException(data['message'] ?? 'Request failed', response.statusCode);
  }
}

class ChatRequest {
  final String? prompt;
  final List<ChatMessage>? messages;
  final String? model;
  final bool? stream;
  final ThinkingConfig? thinkingConfig;
  final GenerationConfig? generationConfig;
  final List<Tool>? tools;

  ChatRequest({
    this.prompt,
    this.messages,
    this.model,
    this.stream,
    this.thinkingConfig,
    this.generationConfig,
    this.tools,
  });

  Map<String, dynamic> toJson() => {
    if (prompt != null) 'prompt': prompt,
    if (messages != null) 'messages': messages!.map((m) => m.toJson()).toList(),
    if (model != null) 'model': model,
    if (stream != null) 'stream': stream,
    if (thinkingConfig != null) 'thinkingConfig': thinkingConfig!.toJson(),
    if (generationConfig != null) 'generationConfig': generationConfig!.toJson(),
    if (tools != null) 'tools': tools!.map((t) => t.toJson()).toList(),
  };
}

class ChatMessage {
  final String role;
  final String content;

  ChatMessage({required this.role, required this.content});

  Map<String, dynamic> toJson() => {'role': role, 'content': content};
  
  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      role: json['role'] as String,
      content: json['content'] as String,
    );
  }
}

class ChatResponse {
  final ChatMessage message;
  final UsageMetadata? usageMetadata;
  final String? conversationId;
  final List<String>? thoughts;
  final GroundingMetadata? groundingMetadata;

  ChatResponse({
    required this.message,
    this.usageMetadata,
    this.conversationId,
    this.thoughts,
    this.groundingMetadata,
  });

  factory ChatResponse.fromJson(Map<String, dynamic> json) {
    return ChatResponse(
      message: ChatMessage.fromJson(json['message']),
      usageMetadata: json['usageMetadata'] != null
          ? UsageMetadata.fromJson(json['usageMetadata'])
          : null,
      conversationId: json['conversationId'],
      thoughts: (json['thoughts'] as List?)?.cast<String>(),
      groundingMetadata: json['groundingMetadata'] != null
          ? GroundingMetadata.fromJson(json['groundingMetadata'])
          : null,
    );
  }
}

class ChatStreamChunk {
  final String? text;
  final String? thought;
  final bool done;
  final UsageMetadata? usageMetadata;

  ChatStreamChunk({
    this.text,
    this.thought,
    required this.done,
    this.usageMetadata,
  });

  factory ChatStreamChunk.fromJson(Map<String, dynamic> json) {
    return ChatStreamChunk(
      text: json['text'],
      thought: json['thought'],
      done: json['done'] ?? false,
      usageMetadata: json['usageMetadata'] != null
          ? UsageMetadata.fromJson(json['usageMetadata'])
          : null,
    );
  }
}

class ThinkingConfig {
  final int? thinkingBudget;
  final String? thinkingLevel;
  final bool? includeThoughts;

  ThinkingConfig({this.thinkingBudget, this.thinkingLevel, this.includeThoughts});

  Map<String, dynamic> toJson() => {
    if (thinkingBudget != null) 'thinkingBudget': thinkingBudget,
    if (thinkingLevel != null) 'thinkingLevel': thinkingLevel,
    if (includeThoughts != null) 'includeThoughts': includeThoughts,
  };
}

class GenerationConfig {
  final double? temperature;
  final double? topP;
  final int? topK;
  final int? maxOutputTokens;

  GenerationConfig({this.temperature, this.topP, this.topK, this.maxOutputTokens});

  Map<String, dynamic> toJson() => {
    if (temperature != null) 'temperature': temperature,
    if (topP != null) 'topP': topP,
    if (topK != null) 'topK': topK,
    if (maxOutputTokens != null) 'maxOutputTokens': maxOutputTokens,
  };
}

class Tool {
  final bool? googleSearch;
  final bool? codeExecution;

  Tool({this.googleSearch, this.codeExecution});

  Map<String, dynamic> toJson() => {
    if (googleSearch != null) 'googleSearch': {'enabled': googleSearch},
    if (codeExecution != null) 'codeExecution': {},
  };
}

class UsageMetadata {
  final int promptTokenCount;
  final int candidatesTokenCount;
  final int totalTokenCount;

  UsageMetadata({
    required this.promptTokenCount,
    required this.candidatesTokenCount,
    required this.totalTokenCount,
  });

  factory UsageMetadata.fromJson(Map<String, dynamic> json) {
    return UsageMetadata(
      promptTokenCount: json['promptTokenCount'] ?? 0,
      candidatesTokenCount: json['candidatesTokenCount'] ?? 0,
      totalTokenCount: json['totalTokenCount'] ?? 0,
    );
  }
}

class GroundingMetadata {
  final List<String>? webSearchQueries;
  final List<GroundingChunk>? groundingChunks;

  GroundingMetadata({this.webSearchQueries, this.groundingChunks});

  factory GroundingMetadata.fromJson(Map<String, dynamic> json) {
    return GroundingMetadata(
      webSearchQueries: (json['webSearchQueries'] as List?)?.cast<String>(),
      groundingChunks: (json['groundingChunks'] as List?)
          ?.map((c) => GroundingChunk.fromJson(c))
          .toList(),
    );
  }
}

class GroundingChunk {
  final String? uri;
  final String? title;

  GroundingChunk({this.uri, this.title});

  factory GroundingChunk.fromJson(Map<String, dynamic> json) {
    final web = json['web'];
    return GroundingChunk(
      uri: web?['uri'],
      title: web?['title'],
    );
  }
}

class ApiException implements Exception {
  final String message;
  final int statusCode;
  ApiException(this.message, this.statusCode);
}
```

---

## Image Generation

```dart
// lib/features/image/data/image_api_v2.dart
class ImageApiV2 {
  final String _baseUrl;
  final String _accessToken;
  final http.Client _client;

  ImageApiV2({required String baseUrl, required String accessToken, http.Client? client})
      : _baseUrl = baseUrl, _accessToken = accessToken, _client = client ?? http.Client();

  Future<ImageResponse> generate(ImageRequest request) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/image/generate'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_accessToken',
      },
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode == 200) {
      return ImageResponse.fromJson(jsonDecode(response.body));
    }
    throw ApiException(jsonDecode(response.body)['message'], response.statusCode);
  }
}

class ImageRequest {
  final String prompt;
  final String? model;
  final String? negativePrompt;
  final String? aspectRatio;
  final int? numberOfImages;

  ImageRequest({
    required this.prompt,
    this.model,
    this.negativePrompt,
    this.aspectRatio,
    this.numberOfImages,
  });

  Map<String, dynamic> toJson() => {
    'prompt': prompt,
    if (model != null) 'model': model,
    if (negativePrompt != null) 'negativePrompt': negativePrompt,
    if (aspectRatio != null) 'aspectRatio': aspectRatio,
    if (numberOfImages != null) 'numberOfImages': numberOfImages,
  };
}

class ImageResponse {
  final bool success;
  final String model;
  final List<GeneratedImage> images;

  ImageResponse({required this.success, required this.model, required this.images});

  factory ImageResponse.fromJson(Map<String, dynamic> json) {
    return ImageResponse(
      success: json['success'] ?? false,
      model: json['model'] ?? '',
      images: (json['images'] as List?)
          ?.map((i) => GeneratedImage.fromJson(i))
          .toList() ?? [],
    );
  }
}

class GeneratedImage {
  final String url;
  final String? gcsUri;
  final String? filename;
  final String? mimeType;

  GeneratedImage({required this.url, this.gcsUri, this.filename, this.mimeType});

  factory GeneratedImage.fromJson(Map<String, dynamic> json) {
    return GeneratedImage(
      url: json['url'] ?? '',
      gcsUri: json['gcsUri'],
      filename: json['filename'],
      mimeType: json['mimeType'],
    );
  }
}
```

---

## Video Generation

```dart
// lib/features/video/data/video_api_v2.dart
class VideoApiV2 {
  final String _baseUrl;
  final String _accessToken;
  final http.Client _client;

  VideoApiV2({required String baseUrl, required String accessToken, http.Client? client})
      : _baseUrl = baseUrl, _accessToken = accessToken, _client = client ?? http.Client();

  /// Text-to-Video
  Future<VideoResponse> generate(VideoRequest request) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/video/generate'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_accessToken',
      },
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode == 200) {
      return VideoResponse.fromJson(jsonDecode(response.body));
    }
    throw ApiException(jsonDecode(response.body)['message'], response.statusCode);
  }

  /// Image-to-Video
  Future<VideoResponse> imageToVideo(ImageToVideoRequest request) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/video/image-to-video'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_accessToken',
      },
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode == 200) {
      return VideoResponse.fromJson(jsonDecode(response.body));
    }
    throw ApiException(jsonDecode(response.body)['message'], response.statusCode);
  }
}

class VideoRequest {
  final String prompt;
  final String? model;
  final String? negativePrompt;
  final String? aspectRatio;
  final int? durationSeconds;
  final bool? generateAudio;

  VideoRequest({
    required this.prompt,
    this.model,
    this.negativePrompt,
    this.aspectRatio,
    this.durationSeconds,
    this.generateAudio,
  });

  Map<String, dynamic> toJson() => {
    'prompt': prompt,
    if (model != null) 'model': model,
    if (negativePrompt != null) 'negativePrompt': negativePrompt,
    if (aspectRatio != null) 'aspectRatio': aspectRatio,
    if (durationSeconds != null) 'durationSeconds': durationSeconds,
    if (generateAudio != null) 'generateAudio': generateAudio,
  };
}

class ImageToVideoRequest {
  final String prompt;
  final String imageBase64;
  final String? mimeType;
  final int? durationSeconds;
  final bool? generateAudio;

  ImageToVideoRequest({
    required this.prompt,
    required this.imageBase64,
    this.mimeType,
    this.durationSeconds,
    this.generateAudio,
  });

  Map<String, dynamic> toJson() => {
    'prompt': prompt,
    'image': {
      'bytesBase64Encoded': imageBase64,
      'mimeType': mimeType ?? 'image/png',
    },
    if (durationSeconds != null) 'durationSeconds': durationSeconds,
    if (generateAudio != null) 'generateAudio': generateAudio,
  };
}

class VideoResponse {
  final bool success;
  final String url;
  final String? gcsUri;
  final String? filename;
  final String model;
  final int duration;
  final String aspectRatio;
  final bool hasAudio;

  VideoResponse({
    required this.success,
    required this.url,
    this.gcsUri,
    this.filename,
    required this.model,
    required this.duration,
    required this.aspectRatio,
    required this.hasAudio,
  });

  factory VideoResponse.fromJson(Map<String, dynamic> json) {
    return VideoResponse(
      success: json['success'] ?? false,
      url: json['url'] ?? '',
      gcsUri: json['gcsUri'],
      filename: json['filename'],
      model: json['model'] ?? '',
      duration: json['duration'] ?? 8,
      aspectRatio: json['aspectRatio'] ?? '16:9',
      hasAudio: json['hasAudio'] ?? false,
    );
  }
}
```

---

## Music Generation

```dart
// lib/features/music/data/music_api_v2.dart
class MusicApiV2 {
  final String _baseUrl;
  final String _accessToken;
  final http.Client _client;

  MusicApiV2({required String baseUrl, required String accessToken, http.Client? client})
      : _baseUrl = baseUrl, _accessToken = accessToken, _client = client ?? http.Client();

  Future<MusicResponse> generate(MusicRequest request) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/music/generate'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_accessToken',
      },
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode == 200) {
      return MusicResponse.fromJson(jsonDecode(response.body));
    }
    throw ApiException(jsonDecode(response.body)['message'], response.statusCode);
  }
}

class MusicRequest {
  final List<WeightedPrompt> prompts;
  final int? durationSeconds;
  final int? bpm;
  final double? temperature;

  MusicRequest({
    required this.prompts,
    this.durationSeconds,
    this.bpm,
    this.temperature,
  });

  Map<String, dynamic> toJson() => {
    'prompts': prompts.map((p) => p.toJson()).toList(),
    if (durationSeconds != null) 'durationSeconds': durationSeconds,
    if (bpm != null) 'bpm': bpm,
    if (temperature != null) 'temperature': temperature,
  };
}

class WeightedPrompt {
  final String text;
  final double weight;

  WeightedPrompt({required this.text, this.weight = 1.0});

  Map<String, dynamic> toJson() => {'text': text, 'weight': weight};
}

class MusicResponse {
  final bool success;
  final String url;
  final String? gcsUri;
  final String? filename;
  final String model;
  final int durationSeconds;

  MusicResponse({
    required this.success,
    required this.url,
    this.gcsUri,
    this.filename,
    required this.model,
    required this.durationSeconds,
  });

  factory MusicResponse.fromJson(Map<String, dynamic> json) {
    return MusicResponse(
      success: json['success'] ?? false,
      url: json['url'] ?? '',
      gcsUri: json['gcsUri'],
      filename: json['filename'],
      model: json['model'] ?? '',
      durationSeconds: json['durationSeconds'] ?? 30,
    );
  }
}
```

---

## TTS (Text-to-Speech)

```dart
// lib/features/tts/data/tts_api_v2.dart
class TtsApiV2 {
  final String _baseUrl;
  final String _accessToken;
  final http.Client _client;

  TtsApiV2({required String baseUrl, required String accessToken, http.Client? client})
      : _baseUrl = baseUrl, _accessToken = accessToken, _client = client ?? http.Client();

  /// Get available voices
  Future<List<VoiceInfo>> getVoices() async {
    final response = await _client.get(
      Uri.parse('$_baseUrl/tts/voices'),
      headers: {'Authorization': 'Bearer $_accessToken'},
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return (data['voices'] as List)
          .map((v) => VoiceInfo.fromJson(v))
          .toList();
    }
    throw ApiException('Failed to get voices', response.statusCode);
  }

  /// Single speaker TTS
  Future<TtsResponse> generateSingle(SingleTtsRequest request) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/tts/single'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_accessToken',
      },
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode == 200) {
      return TtsResponse.fromJson(jsonDecode(response.body));
    }
    throw ApiException(jsonDecode(response.body)['message'], response.statusCode);
  }

  /// Multi-speaker TTS
  Future<TtsResponse> generateMulti(MultiTtsRequest request) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/tts/multi'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_accessToken',
      },
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode == 200) {
      return TtsResponse.fromJson(jsonDecode(response.body));
    }
    throw ApiException(jsonDecode(response.body)['message'], response.statusCode);
  }
}

class VoiceInfo {
  final String name;
  final String? description;

  VoiceInfo({required this.name, this.description});

  factory VoiceInfo.fromJson(Map<String, dynamic> json) {
    return VoiceInfo(
      name: json['name'] ?? '',
      description: json['description'],
    );
  }
}

class SingleTtsRequest {
  final String text;
  final String? voiceName;
  final String? model;

  SingleTtsRequest({required this.text, this.voiceName, this.model});

  Map<String, dynamic> toJson() => {
    'text': text,
    if (voiceName != null) 'voiceName': voiceName,
    if (model != null) 'model': model,
  };
}

class MultiTtsRequest {
  final String text;
  final List<SpeakerConfig> speakerConfigs;

  MultiTtsRequest({required this.text, required this.speakerConfigs});

  Map<String, dynamic> toJson() => {
    'text': text,
    'speakerConfigs': speakerConfigs.map((s) => s.toJson()).toList(),
  };
}

class SpeakerConfig {
  final String speakerName;
  final String voiceName;

  SpeakerConfig({required this.speakerName, required this.voiceName});

  Map<String, dynamic> toJson() => {
    'speakerName': speakerName,
    'voiceName': voiceName,
  };
}

class TtsResponse {
  final bool success;
  final String url;
  final String? gcsUri;
  final String? filename;
  final String? mimeType;

  TtsResponse({
    required this.success,
    required this.url,
    this.gcsUri,
    this.filename,
    this.mimeType,
  });

  factory TtsResponse.fromJson(Map<String, dynamic> json) {
    return TtsResponse(
      success: json['success'] ?? false,
      url: json['url'] ?? '',
      gcsUri: json['gcsUri'],
      filename: json['filename'],
      mimeType: json['mimeType'],
    );
  }
}
```

---

## Usage Example

```dart
// Example: Chat with streaming
final chatApi = ChatApiV2(
  baseUrl: 'https://your-backend.com/api/v2',
  accessToken: authProvider.accessToken!,
);

// Streaming
final stream = chatApi.streamChat(ChatRequest(
  prompt: 'Tell me about Flutter',
  model: 'gemini-2.5-flash',
  thinkingConfig: ThinkingConfig(thinkingBudget: 1024),
));

await for (final chunk in stream) {
  print(chunk.text); // Print each chunk as it arrives
  if (chunk.thought != null) {
    print('Thinking: ${chunk.thought}');
  }
}
```
