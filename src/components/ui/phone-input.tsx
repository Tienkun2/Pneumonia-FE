import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import RPNInput, { 
  type Value, 
  type Country, 
  getCountryCallingCode, 
  type FlagProps, 
  type Props as RPNInputProps 
} from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input, type InputProps } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";

type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> &
  Omit<RPNInputProps<typeof RPNInput>, "onChange"> & {
    onChange?: (value: Value) => void;
  };

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<React.ElementRef<typeof RPNInput>, PhoneInputProps>(
    ({ className, onChange, value, ...props }, ref) => {
      
      const handlePhoneChange = (newValue: Value) => {
        onChange?.(newValue || ("" as Value));
      };

      const handleCountryChange = (country: Country | undefined) => {
        if (country) {
          const callingCode = getCountryCallingCode(country);
          onChange?.(`+${callingCode}` as Value);
        } else {
          onChange?.("" as Value);
        }
      };

      return (
        <RPNInput
          ref={ref}
          className={cn("flex items-center", className)}
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelect}
          inputComponent={InputComponent}
          smartCaret={true}
          international
          value={value}
          onChange={handlePhoneChange}
          onCountryChange={handleCountryChange}
          {...props}
        />
      );
    },
  );
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <Input
      className={cn(
        "rounded-e-md rounded-s-none h-11 border-l-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all",
        className
      )}
      {...props}
      ref={ref}
    />
  ),
);
InputComponent.displayName = "InputComponent";

type CountrySelectOption = { label: string; value: Country };

type CountrySelectProps = {
  disabled?: boolean;
  value: Country;
  onChange: (value: Country) => void;
  options: CountrySelectOption[];
};

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) => {
  const handleSelect = React.useCallback(
    (country: Country) => {
      onChange(country);
    },
    [onChange],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={"outline"}
          className={cn(
            "flex gap-1.5 rounded-e-none rounded-s-md px-3 h-11 border-r border-input/50 bg-white hover:bg-slate-50 transition-colors focus:ring-0"
          )}
          disabled={disabled}
        >
          <FlagComponent country={value} countryName={value} />
          <ChevronsUpDown
            className={cn(
              "-mr-2 h-3.5 w-3.5 opacity-40 transition-opacity",
              disabled ? "hidden" : "group-hover:opacity-100"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[300px] p-0 z-[100] bg-white border border-slate-200 shadow-2xl rounded-xl" 
        align="start"
      >
        <Command className="bg-white">
          <CommandInput placeholder="Tìm theo tên hoặc mã vùng..." className="bg-transparent border-none focus:ring-0" />
          <CommandList className="max-h-72 overflow-y-auto w-full">
            <CommandEmpty className="py-6 text-center text-sm text-slate-500 font-medium">Không tìm thấy quốc gia.</CommandEmpty>
            <CommandGroup heading="Tất cả quốc gia" className="px-2">
              {options
                .filter((x) => x.value)
                .map((option) => (
                  <CommandItem
                    className="gap-3 cursor-pointer py-2.5 px-3 rounded-lg hover:bg-slate-100 transition-all text-slate-900 aria-selected:bg-slate-100 font-medium opacity-100"
                    key={option.value}
                    value={`${option.label} ${getCountryCallingCode(option.value)} ${option.value}`}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={() => {
                      handleSelect(option.value);
                    }}
                  >
                    <FlagComponent
                      country={option.value}
                      countryName={option.label}
                    />
                    <span className="flex-1 text-sm font-semibold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">
                      {option.label}
                    </span>
                    {option.value && (
                      <span className="text-slate-500 text-xs font-semibold tabular-nums">
                        {`+${getCountryCallingCode(option.value)}`}
                      </span>
                    )}
                    {option.value === value && (
                      <Check className="ml-auto h-4 w-4 text-emerald-600 shrink-0" />
                    )}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const FlagComponent = ({ country, countryName }: FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 shadow-sm transition-all group-hover:border-slate-300">
      {Flag && (
        <div className="flex h-[110%] w-[110%] shrink-0 items-center justify-center scale-[1.5]">
          <Flag title={countryName} />
        </div>
      )}
    </span>
  );
};
FlagComponent.displayName = "FlagComponent";

export { PhoneInput };
