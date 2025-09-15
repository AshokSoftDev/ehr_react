import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, RefreshCw, User, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
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

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [captchaText, setCaptchaText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Draw captcha on canvas
  const drawCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Add dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Draw captcha text
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw each character with random rotation and position
    const text = captchaText;
    const charWidth = canvas.width / (text.length + 1);
    
    text.split('').forEach((char, i) => {
      ctx.save();
      const x = charWidth * (i + 1);
      const y = canvas.height / 2 + (Math.random() - 0.5) * 10;
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.4);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });
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
    generateCaptcha();
    form.setValue('captcha', '');
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
      // if (data.rememberMe) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
      // } else {
      //   sessionStorage.setItem('access_token', accessToken);
      //   sessionStorage.setItem('user', JSON.stringify(user));
      //   if (refreshToken) {
      //     sessionStorage.setItem('refresh_token', refreshToken);
      //   }
      // }

      toast.success('Login successful!');
      navigate(from, { replace: true });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      refreshCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo or App Name */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">EHR System</h1>
          <p className="text-muted-foreground">Healthcare Management Portal</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                    <FormFloatingInput
                      control={form.control}
                      name="email"
                      label="Email Address"
                      type="email"
                      className="pl-10"
                      inputClassName="pl-10"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                    <FormFloatingInput
                      control={form.control}
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      className="pl-10"
                      inputClassName="pl-10 pr-10"
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

                {/* Captcha Section */}
                <div className="space-y-2">
                  <Label>Security Check</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <canvas
                        ref={canvasRef}
                        width={200}
                        height={50}
                        className="border rounded-md w-full"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={refreshCaptcha}
                      className="h-[50px]"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    {...form.register('captcha')}
                    placeholder="Enter captcha"
                    className={cn(
                      form.formState.errors.captcha && "border-destructive"
                    )}
                  />
                  {form.formState.errors.captcha && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.captcha.message}
                    </p>
                  )}
                </div>

                {/* Remember Me and Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      {...form.register('rememberMe')}
                    />
                    <Label
                      htmlFor="rememberMe"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
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

          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  New to our platform?
                </span>
              </div>
            </div>

            <Link to="/register" className="w-full">
              <Button variant="outline" className="w-full">
                Create an Account
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 EHR System. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
