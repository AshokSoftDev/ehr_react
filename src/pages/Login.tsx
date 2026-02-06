import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, RefreshCw, User, Lock, Shield, Activity, Heart, Stethoscope, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form } from '../components/ui/form';
import { FormFloatingInput } from '../components/form/form-floating-input';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Checkbox } from '../components/ui/checkbox';
import { api } from '../lib/api';
import { toast } from 'react-toastify';
import { cn } from '../lib/utils';

// Login validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  captcha: z.string().min(1, 'Please enter the captcha'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginResponse {
  status: string;
  data: {
    user: {
      userId: string;
      email: string;
      fullName: string;
      accountType: string;
      groupId?: string;
    };
    accessToken: string;
    refreshToken?: string;
  };
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [captchaText, setCaptchaText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const from = location.state?.from?.pathname || '/main/Dashboard';

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      captcha: '',
      rememberMe: false,
    },
  });

  // Generate random captcha text
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let text = '';
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    return text;
  };

  const drawCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    // Set canvas size
    const width = canvas.width;
    const height = canvas.height;
  
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
  
    // Create subtle gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, width, 0);
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      bgGradient.addColorStop(0, 'rgba(12, 74, 110, 0.95)');
      bgGradient.addColorStop(1, 'rgba(8, 47, 73, 0.95)');
    } else {
      bgGradient.addColorStop(0, 'rgba(13, 110, 253, 0.95)');
      bgGradient.addColorStop(1, 'rgba(49, 196, 255, 0.95)');
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
  
    // Add decorative elements
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = isDark 
        ? `rgba(147, 197, 253, ${0.1 + i * 0.05})`
        : `rgba(99, 102, 241, ${0.08 + i * 0.03})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      const y = (height / 4) * (i + 1);
      ctx.moveTo(0, y);
      for (let x = 0; x <= width; x += 5) {
        ctx.lineTo(x, y + Math.sin(x * 0.05) * 3);
      }
      ctx.stroke();
    }
  
    // Draw captcha text with varied styles
    const text = captchaText;
    const letterSpacing = width / (text.length + 1);
    
    // Different font styles to choose from
    const fontStyles = [
      { weight: '400', style: 'normal' },
      { weight: '500', style: 'italic' },
      { weight: '600', style: 'normal' },
      { weight: '300', style: 'normal' },
      { weight: '700', style: 'normal' }
    ];
  
    // Font families for variety
    const fontFamilies = [
      'Georgia, serif',
      '-apple-system, BlinkMacSystemFont, sans-serif',
      'Menlo, Monaco, monospace',
      'Helvetica Neue, Arial, sans-serif'
    ];
  
    // Draw each character with unique style
    text.split('').forEach((char, i) => {
      ctx.save();
      
      const x = letterSpacing * (i + 1);
      const y = height / 2;
      
      // Random transformations
      ctx.translate(x, y);
      
      // More subtle rotation
      const rotation = (Math.random() - 0.5) * 0.15;
      ctx.rotate(rotation);
      
      // Vary the font size slightly
      const fontSize = 16 + Math.random() * 4;
      
      // Pick random font style
      const fontStyle = fontStyles[Math.floor(Math.random() * fontStyles.length)];
      const fontFamily = fontFamilies[Math.floor(Math.random() * fontFamilies.length)];
      
      ctx.font = `${fontStyle.style} ${fontStyle.weight} ${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Create gradient for each letter
      const charGradient = ctx.createLinearGradient(0, -fontSize/2, 0, fontSize/2);
      
      charGradient.addColorStop(0, 'rgba(255,255,255,1)');
      charGradient.addColorStop(1, 'rgba(255,255,255,0.85)');
      
      // Apply gradient fill
      ctx.fillStyle = charGradient;
      
      // Add subtle shadow
      ctx.shadowColor = isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 0.5;
      ctx.shadowOffsetY = 0.5;
      
      // Add slight skew for some characters
      if (Math.random() > 0.5) {
        ctx.transform(1, 0, (Math.random() - 0.5) * 0.2, 1, 0, 0);
      }
      
      // Draw character
      ctx.fillText(char, 0, 0);
      
      // Add decorative underline for some characters
      if (Math.random() > 0.7) {
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-fontSize/3, fontSize/3);
        ctx.lineTo(fontSize/3, fontSize/3);
        ctx.stroke();
      }
      
      ctx.restore();
    });
  
    // Add artistic noise pattern
    ctx.globalAlpha = 0.1;
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        if (Math.random() > 0.5) {
          ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    ctx.globalAlpha = 1;
  
    // Add subtle vignette effect
    const vignette = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  };
  

  // Initialize captcha
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Redraw captcha when text changes
  useEffect(() => {
    drawCaptcha();
  }, [captchaText]);

  const refreshCaptcha = () => {
    setIsRefreshing(true);
    generateCaptcha();
    form.setValue('captcha', '');
    setTimeout(() => setIsRefreshing(false), 300);
  };

  const handleSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate captcha
      if (data.captcha.toLowerCase() !== captchaText.toLowerCase()) {
        form.setError('captcha', { message: 'Incorrect captcha' });
        refreshCaptcha();
        return;
      }

      // Make login API call
      const response = await api.post<LoginResponse>('/users/login', {
        email: data.email,
        password: data.password,
      });

      const { user, accessToken, refreshToken } = response.data.data;

      // Store tokens
      if (data.rememberMe) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
      } else {
        sessionStorage.setItem('access_token', accessToken);
        sessionStorage.setItem('user', JSON.stringify(user));
        if (refreshToken) {
          sessionStorage.setItem('refresh_token', refreshToken);
        }
      }

      toast.success('Login successful!');
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const message = apiError.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      refreshCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 bg-primary-gradient opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-gradient-radial opacity-20 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-gradient-radial opacity-20 blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Left Panel - Feature Showcase (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary-gradient items-center justify-center p-12">
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center mb-8">
            <Heart className="h-12 w-12 text-primary-foreground mr-4" />
            <h1 className="text-4xl font-bold text-primary-foreground">EHR System</h1>
          </div>
          
          <h2 className="text-3xl font-light text-primary-foreground mb-6">
            Advanced Healthcare Management Platform
          </h2>
          
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Streamline your healthcare operations with our comprehensive electronic health records system.
          </p>

          {/* Feature highlights */}
          <div className="space-y-4">
            <div className="flex items-center text-primary-foreground/90">
              <Shield className="h-6 w-6 mr-3 flex-shrink-0" />
              <span>HIPAA Compliant Security</span>
            </div>
            <div className="flex items-center text-primary-foreground/90">
              <Activity className="h-6 w-6 mr-3 flex-shrink-0" />
              <span>Real-time Patient Monitoring</span>
            </div>
            <div className="flex items-center text-primary-foreground/90">
              <Stethoscope className="h-6 w-6 mr-3 flex-shrink-0" />
              <span>Comprehensive Medical Records</span>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-10 w-10 text-primary mr-3" />
              <h1 className="text-3xl font-bold text-primary-gradient">EHR System</h1>
            </div>
            <p className="text-muted-foreground">Healthcare Management Portal</p>
          </div>

          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-card/95">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-semibold text-center">Welcome Back</CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                  {error && (
                    <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Email Field */}
                  <div className="space-y-2">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" />
                      <FormFloatingInput
                        control={form.control}
                        name="email"
                        label="Email Address"
                        type="email"
                        className="pl-10"
                        inputClassName="pl-3 bg-background/50 backdrop-blur-sm"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" />
                      <FormFloatingInput
                        control={form.control}
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        className="pl-10"
                        inputClassName="pl-3 pr-10 bg-background/50 backdrop-blur-sm"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Compact Captcha Section - All in one row */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-medium">Security Verification</Label>
                    </div>
                    
                    {/* Single row for captcha, input, and refresh button - wraps on mobile */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                      {/* Captcha Canvas */}
                      <div className="w-full sm:w-auto">
                        <canvas
                          ref={canvasRef}
                          width={140}
                          height={36}
                          className="w-[140px] h-[36px] rounded-md border border-input bg-background"
                          style={{ imageRendering: 'crisp-edges' }}
                        />
                      </div>

                      {/* Captcha Input */}
                      <div className="flex-1 min-w-[120px]">
                        <Input
                          {...form.register('captcha')}
                          placeholder="Enter code"
                          className={cn(
                            "h-[36px] bg-background/50 backdrop-blur-sm",
                            form.formState.errors.captcha && "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                      </div>

                      {/* Refresh Button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={refreshCaptcha}
                        className={cn(
                          "h-[36px] w-[36px] p-0 rounded-md",
                          "bg-primary/10 hover:bg-primary/20",
                          "border border-primary/20 hover:border-primary/30",
                          "transition-all duration-300",
                          "group relative overflow-hidden flex-shrink-0"
                        )}
                        disabled={isRefreshing}
                      >
                        <div className="absolute inset-0 bg-primary-gradient opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        <RefreshCw className={cn(
                          "h-4 w-4 text-primary relative z-10",
                          isRefreshing && "animate-spin"
                        )} />
                        {!isRefreshing && (
                          <Sparkles className="absolute h-3 w-3 text-primary/60 -top-1 -right-1 animate-pulse" />
                        )}
                      </Button>
                    </div>

                    {/* Error message */}
                    {form.formState.errors.captcha && (
                      <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-destructive"></span>
                        {form.formState.errors.captcha.message}
                      </p>
                    )}
                  </div>

                  {/* Remember Me and Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={form.watch('rememberMe')}
                        onCheckedChange={(checked) => form.setValue('rememberMe', checked === true)}
                        className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label
                        htmlFor="rememberMe"
                        className="text-sm font-normal cursor-pointer select-none"
                      >
                        Remember me
                      </Label>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-primary-gradient hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>


          </Card>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 EHR System. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <Link to="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <span>•</span>
              <Link to="/support" className="hover:text-primary transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
