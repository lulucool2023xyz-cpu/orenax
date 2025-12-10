# Auth Implementation Guide (Flutter/Dart)

Complete authentication implementation for Flutter mobile apps.

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Email registration |
| POST | `/auth/login` | Email login |
| POST | `/auth/google` | Google ID token login |
| POST | `/auth/facebook` | Facebook token login |
| POST | `/auth/github` | GitHub token login |
| GET | `/auth/google/url` | Get Google OAuth URL |
| GET | `/auth/me` | Get current user |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/logout` | Logout |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/update-password` | Update password |

---

## Models

### UserModel

```dart
// lib/features/auth/models/user_model.dart
class UserModel {
  final String id;
  final String email;
  final String? name;
  final String? fullName;
  final String? avatarUrl;
  final bool emailVerified;

  UserModel({
    required this.id,
    required this.email,
    this.name,
    this.fullName,
    this.avatarUrl,
    this.emailVerified = false,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String?,
      fullName: json['fullName'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      emailVerified: json['emailVerified'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'name': name,
    'fullName': fullName,
    'avatarUrl': avatarUrl,
    'emailVerified': emailVerified,
  };
}
```

### AuthResponse

```dart
// lib/features/auth/models/auth_response.dart
class AuthResponse {
  final String message;
  final UserModel user;
  final String accessToken;
  final String refreshToken;
  final int expiresIn;
  final int? expiresAt;

  AuthResponse({
    required this.message,
    required this.user,
    required this.accessToken,
    required this.refreshToken,
    required this.expiresIn,
    this.expiresAt,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      message: json['message'] as String,
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      expiresIn: json['expiresIn'] as int,
      expiresAt: json['expiresAt'] as int?,
    );
  }
}
```

---

## Auth API Service

```dart
// lib/features/auth/data/auth_api.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user_model.dart';
import '../models/auth_response.dart';

class AuthApi {
  static const String _baseUrl = 'https://your-backend.com/auth';
  final http.Client _client;

  AuthApi({http.Client? client}) : _client = client ?? http.Client();

  /// Register with email and password
  Future<AuthResponse> register({
    required String email,
    required String password,
    required String name,
  }) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
        'name': name,
      }),
    );

    return _handleAuthResponse(response);
  }

  /// Login with email and password
  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    return _handleAuthResponse(response);
  }

  /// Login with Google ID token
  Future<AuthResponse> loginWithGoogle(String idToken) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/google'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'accessToken': idToken}),
    );

    return _handleAuthResponse(response);
  }

  /// Login with Facebook access token
  Future<AuthResponse> loginWithFacebook(String accessToken) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/facebook'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'accessToken': accessToken}),
    );

    return _handleAuthResponse(response);
  }

  /// Login with GitHub access token
  Future<AuthResponse> loginWithGitHub(String accessToken) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/github'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'accessToken': accessToken}),
    );

    return _handleAuthResponse(response);
  }

  /// Get current user
  Future<UserModel> getCurrentUser(String accessToken) async {
    final response = await _client.get(
      Uri.parse('$_baseUrl/me'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $accessToken',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return UserModel.fromJson(data['user']);
    }
    throw _handleError(response);
  }

  /// Refresh access token
  Future<AuthResponse> refreshToken(String refreshToken) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/refresh'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'refreshToken': refreshToken}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      // Refresh returns session, need to construct AuthResponse
      return AuthResponse(
        message: data['message'],
        user: UserModel(id: '', email: ''), // Will be fetched separately
        accessToken: data['session']['access_token'],
        refreshToken: data['session']['refresh_token'],
        expiresIn: data['session']['expires_in'],
      );
    }
    throw _handleError(response);
  }

  /// Logout
  Future<void> logout(String accessToken) async {
    await _client.post(
      Uri.parse('$_baseUrl/logout'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $accessToken',
      },
    );
  }

  /// Request password reset
  Future<void> forgotPassword(String email, {String? redirectTo}) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/forgot-password'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        if (redirectTo != null) 'redirectTo': redirectTo,
      }),
    );

    if (response.statusCode != 200) {
      throw _handleError(response);
    }
  }

  /// Update password
  Future<void> updatePassword(String accessToken, String newPassword) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/update-password'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'accessToken': accessToken,
        'newPassword': newPassword,
      }),
    );

    if (response.statusCode != 200) {
      throw _handleError(response);
    }
  }

  AuthResponse _handleAuthResponse(http.Response response) {
    if (response.statusCode == 200 || response.statusCode == 201) {
      return AuthResponse.fromJson(jsonDecode(response.body));
    }
    throw _handleError(response);
  }

  Exception _handleError(http.Response response) {
    final data = jsonDecode(response.body);
    return AuthException(
      data['message'] ?? 'Authentication failed',
      response.statusCode,
    );
  }
}

class AuthException implements Exception {
  final String message;
  final int statusCode;
  AuthException(this.message, this.statusCode);
  
  @override
  String toString() => message;
}
```

---

## Secure Storage

```dart
// lib/core/services/storage_service.dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StorageService {
  static const _storage = FlutterSecureStorage();
  
  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';
  static const _userKey = 'user_data';

  /// Save tokens
  static Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storage.write(key: _accessTokenKey, value: accessToken);
    await _storage.write(key: _refreshTokenKey, value: refreshToken);
  }

  /// Get access token
  static Future<String?> getAccessToken() async {
    return await _storage.read(key: _accessTokenKey);
  }

  /// Get refresh token
  static Future<String?> getRefreshToken() async {
    return await _storage.read(key: _refreshTokenKey);
  }

  /// Save user data as JSON
  static Future<void> saveUser(String userJson) async {
    await _storage.write(key: _userKey, value: userJson);
  }

  /// Get user data JSON
  static Future<String?> getUser() async {
    return await _storage.read(key: _userKey);
  }

  /// Clear all auth data
  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
```

---

## Auth Provider (State Management)

```dart
// lib/features/auth/providers/auth_provider.dart
import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../data/auth_api.dart';
import '../models/user_model.dart';
import '../models/auth_response.dart';
import '../../../core/services/storage_service.dart';

enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthProvider with ChangeNotifier {
  final AuthApi _authApi;
  
  AuthStatus _status = AuthStatus.initial;
  UserModel? _user;
  String? _accessToken;
  String? _error;

  AuthProvider({AuthApi? authApi}) : _authApi = authApi ?? AuthApi();

  AuthStatus get status => _status;
  UserModel? get user => _user;
  String? get accessToken => _accessToken;
  String? get error => _error;
  bool get isAuthenticated => _status == AuthStatus.authenticated;

  /// Initialize - check for stored tokens
  Future<void> initialize() async {
    _status = AuthStatus.loading;
    notifyListeners();

    try {
      final token = await StorageService.getAccessToken();
      if (token != null) {
        _accessToken = token;
        _user = await _authApi.getCurrentUser(token);
        _status = AuthStatus.authenticated;
      } else {
        _status = AuthStatus.unauthenticated;
      }
    } catch (e) {
      // Token expired or invalid, try refresh
      await _tryRefreshToken();
    }
    notifyListeners();
  }

  /// Register
  Future<bool> register(String email, String password, String name) async {
    _status = AuthStatus.loading;
    _error = null;
    notifyListeners();

    try {
      final response = await _authApi.register(
        email: email,
        password: password,
        name: name,
      );
      await _handleAuthSuccess(response);
      return true;
    } catch (e) {
      _handleError(e);
      return false;
    }
  }

  /// Login with email
  Future<bool> login(String email, String password) async {
    _status = AuthStatus.loading;
    _error = null;
    notifyListeners();

    try {
      final response = await _authApi.login(email: email, password: password);
      await _handleAuthSuccess(response);
      return true;
    } catch (e) {
      _handleError(e);
      return false;
    }
  }

  /// Login with Google
  Future<bool> loginWithGoogle(String idToken) async {
    _status = AuthStatus.loading;
    _error = null;
    notifyListeners();

    try {
      final response = await _authApi.loginWithGoogle(idToken);
      await _handleAuthSuccess(response);
      return true;
    } catch (e) {
      _handleError(e);
      return false;
    }
  }

  /// Login with Facebook
  Future<bool> loginWithFacebook(String accessToken) async {
    _status = AuthStatus.loading;
    _error = null;
    notifyListeners();

    try {
      final response = await _authApi.loginWithFacebook(accessToken);
      await _handleAuthSuccess(response);
      return true;
    } catch (e) {
      _handleError(e);
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    if (_accessToken != null) {
      try {
        await _authApi.logout(_accessToken!);
      } catch (_) {}
    }
    await StorageService.clearAll();
    _user = null;
    _accessToken = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }

  /// Forgot password
  Future<bool> forgotPassword(String email) async {
    try {
      await _authApi.forgotPassword(email);
      return true;
    } catch (e) {
      _handleError(e);
      return false;
    }
  }

  Future<void> _handleAuthSuccess(AuthResponse response) async {
    _user = response.user;
    _accessToken = response.accessToken;
    
    await StorageService.saveTokens(
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    );
    await StorageService.saveUser(jsonEncode(response.user.toJson()));
    
    _status = AuthStatus.authenticated;
    notifyListeners();
  }

  Future<void> _tryRefreshToken() async {
    try {
      final refreshToken = await StorageService.getRefreshToken();
      if (refreshToken != null) {
        final response = await _authApi.refreshToken(refreshToken);
        _accessToken = response.accessToken;
        await StorageService.saveTokens(
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        );
        _user = await _authApi.getCurrentUser(response.accessToken);
        _status = AuthStatus.authenticated;
      } else {
        _status = AuthStatus.unauthenticated;
      }
    } catch (_) {
      await StorageService.clearAll();
      _status = AuthStatus.unauthenticated;
    }
  }

  void _handleError(dynamic e) {
    _error = e.toString();
    _status = AuthStatus.error;
    notifyListeners();
  }
}
```

---

## Google Sign-In Integration

```dart
// lib/features/auth/services/google_auth_service.dart
import 'package:google_sign_in/google_sign_in.dart';

class GoogleAuthService {
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  /// Sign in with Google and get ID token
  Future<String?> signIn() async {
    try {
      final account = await _googleSignIn.signIn();
      if (account == null) return null;
      
      final auth = await account.authentication;
      return auth.idToken; // Use this token with /auth/google
    } catch (e) {
      print('Google sign-in error: $e');
      return null;
    }
  }

  /// Sign out from Google
  Future<void> signOut() async {
    await _googleSignIn.signOut();
  }
}
```

---

## Facebook Login Integration

```dart
// lib/features/auth/services/facebook_auth_service.dart
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';

class FacebookAuthService {
  /// Sign in with Facebook and get access token
  Future<String?> signIn() async {
    try {
      final result = await FacebookAuth.instance.login(
        permissions: ['email', 'public_profile'],
      );
      
      if (result.status == LoginStatus.success) {
        return result.accessToken?.token; // Use with /auth/facebook
      }
      return null;
    } catch (e) {
      print('Facebook sign-in error: $e');
      return null;
    }
  }

  /// Sign out from Facebook
  Future<void> signOut() async {
    await FacebookAuth.instance.logOut();
  }
}
```

---

## Usage Example

```dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'features/auth/providers/auth_provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..initialize()),
      ],
      child: const MyApp(),
    ),
  );
}

// lib/features/auth/screens/login_screen.dart
class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  Future<void> _login() async {
    final auth = context.read<AuthProvider>();
    final success = await auth.login(
      _emailController.text,
      _passwordController.text,
    );
    
    if (success) {
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(auth.error ?? 'Login failed')),
      );
    }
  }

  Future<void> _loginWithGoogle() async {
    final googleService = GoogleAuthService();
    final idToken = await googleService.signIn();
    
    if (idToken != null) {
      final auth = context.read<AuthProvider>();
      await auth.loginWithGoogle(idToken);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        if (auth.status == AuthStatus.loading) {
          return const Center(child: CircularProgressIndicator());
        }
        
        return Scaffold(
          body: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                TextField(
                  controller: _emailController,
                  decoration: const InputDecoration(labelText: 'Email'),
                ),
                TextField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: 'Password'),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: _login,
                  child: const Text('Login'),
                ),
                const SizedBox(height: 10),
                OutlinedButton.icon(
                  onPressed: _loginWithGoogle,
                  icon: const Icon(Icons.g_mobiledata),
                  label: const Text('Continue with Google'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
```
