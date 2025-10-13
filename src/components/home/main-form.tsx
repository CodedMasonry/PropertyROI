"use client";
import React from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../ui/input-group";

// Utilities
const validateDecimalInput = (value: string): boolean => {
  return /^\d*\.?\d{0,2}$/.test(value);
};

const formatNumber = (num: number) => {
  if (!num && num !== 0) return "";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const parseNumber = (str: string) => {
  if (!str) return 0;
  const cleaned = str.replace(/,/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// Schema
const formSchema = z.object({
  sellPrice: z.number().min(1),
  annualTax: z.number().min(1.0),
  rennovationExpenses: z.number(),
  rentalIncomeMonthly: z.number().min(1),
  vacancyRate: z.number().min(1),
  annualExpenses: z.number().min(1),
  percentDown: z.number(),
  interestRate: z.number(),
  loanDurationYears: z.number(),
  annualAppreciationPercent: z.number(),
});

// Currency Input Component
const CurrencyInput = ({
  field,
  label,
  description,
  inputValues,
  setInputValues,
}: any) => {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const isFocused = inputValues[field.name] !== undefined;

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
          value={
            isFocused
              ? inputValues[field.name]
              : formatNumber(field.state.value)
          }
          onFocus={() => {
            setInputValues((prev: any) => ({
              ...prev,
              [field.name]: String(field.state.value || ""),
            }));
          }}
          onBlur={() => {
            setInputValues((prev: any) => {
              const newValues = { ...prev };
              delete newValues[field.name];
              return newValues;
            });
            field.handleBlur();
          }}
          onChange={(e) => {
            const newValue = e.target.value;
            if (validateDecimalInput(newValue)) {
              setInputValues((prev: any) => ({
                ...prev,
                [field.name]: newValue,
              }));
              field.handleChange(parseNumber(newValue));
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
};

export default function MainForm() {
  const [inputValues, setInputValues] = React.useState<Record<string, string>>(
    {},
  );

  const form = useForm({
    defaultValues: {
      sellPrice: 0,
      annualTax: 0,
      rennovationExpenses: 0,
      rentalIncomeMonthly: 0,
      vacancyRate: 0,
      annualExpenses: 0,
      percentDown: 0,
      interestRate: 0,
      loanDurationYears: 0,
      annualAppreciationPercent: 0,
    },
    validators: {
      onSubmit: formSchema,
      onBlur: formSchema,
    },
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldSet>
        <FieldLegend>Property Details</FieldLegend>
        <FieldDescription>
          The baseline information so ROI can be calculated.
        </FieldDescription>
        <FieldGroup>
          <form.Field
            name="sellPrice"
            children={(field) => (
              <CurrencyInput
                field={field}
                label="Sale Price"
                description="How much was paid or expected to be paid for the property."
                inputValues={inputValues}
                setInputValues={setInputValues}
              />
            )}
          />
          <form.Field
            name="annualTax"
            children={(field) => (
              <CurrencyInput
                field={field}
                label="Annual Tax"
                description="The expected cost in taxes for the Property."
                inputValues={inputValues}
                setInputValues={setInputValues}
              />
            )}
          />
        </FieldGroup>
      </FieldSet>

      <Button type="submit" className="text-white mt-4">
        Calculate
      </Button>
    </form>
  );
}
