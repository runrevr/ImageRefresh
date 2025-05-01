import { useState } from "react";
import { Input, InputProps } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";

interface PasswordInputProps extends Omit<InputProps, "type"> {
  toggleLabel?: string;
}

export function PasswordInput({
  className,
  toggleLabel = "Show password",
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={className}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={toggleLabel}
      >
        {showPassword ? (
          <EyeOffIcon className="h-4 w-4 text-gray-500" />
        ) : (
          <EyeIcon className="h-4 w-4 text-gray-500" />
        )}
      </Button>
    </div>
  );
}