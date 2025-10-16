import React from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "./ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "./ui/input-group";
import { formatNumber, parseNumber, validateDecimalInput } from "@/lib/utils";

export default function CurrencyInput({ field, label, description }: any) {
  const [inputValue, setInputValue] = React.useState<string | undefined>(
    undefined,
  );
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const isFocused = inputValue !== undefined;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>$</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          id={field.name}
          name={field.name}
          type="text"
          inputMode="decimal"
          value={isFocused ? inputValue : formatNumber(field.state.value)}
          onFocus={() => {
            setInputValue(String(field.state.value || ""));
          }}
          onBlur={() => {
            setInputValue(undefined);
            field.handleBlur();
          }}
          onChange={(e) => {
            const newValue = e.target.value;
            if (validateDecimalInput(newValue)) {
              setInputValue(newValue);
              field.handleChange(parseNumber(newValue));
            }
          }}
          onPaste={(e) => {
            const pastedText = e.clipboardData.getData("text");
            if (validateDecimalInput(pastedText)) {
              e.preventDefault();
              const parsed = parseNumber(pastedText);
              setInputValue(pastedText);
              field.handleChange(parsed);
            }
          }}
          aria-invalid={isInvalid}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupText>USD</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
