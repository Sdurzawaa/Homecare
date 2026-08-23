import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export default function PasswordInput({
  name,
  value,
  onChange,
  isVisible,
  onToggleVisibility,
}: PasswordInputProps) {
  return (
    <div className="relative">
      <input
        type={isVisible ? "text" : "password"}
        name={name}
        autoComplete="new-password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-10 text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={onToggleVisibility}
        aria-label={isVisible ? "Sembunyikan password" : "Tampilkan password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition-colors duration-150 hover:scale-110 hover:text-slate-600 transition-transform"
      >
        {isVisible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}
