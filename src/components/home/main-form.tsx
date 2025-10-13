"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  sellPrice: z.number().min(1),
});

export default function MainForm() {
  const form = useForm({
    defaultValues: {
      sellPrice: 0,
    },
    validators: {
      onSubmit: formSchema,
      onBlur: formSchema,
      onChange: formSchema,
    },
    onSubmit: ({ value }) => {
      console.log("hi");
    },
  });

  // Format number with commas
  const formatNumber = (num: number) => {
    if (!num && num !== 0) return "";
    return Number(num).toLocaleString("en-US");
  };

  // Parse formatted string to number
  const parseNumber = (str: string) => {
    if (!str) return 0;
    const cleaned = str.replace(/,/g, "");
    return Number(cleaned) || 0;
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          name="sellPrice"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Average Sale Price</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={formatNumber(field.state.value)}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const parsed = parseNumber(e.target.value);
                    field.handleChange(parsed);
                  }}
                  aria-invalid={isInvalid}
                />
                <FieldDescription>
                  Provide a concise title for your bug report.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        ></form.Field>
      </FieldGroup>
      <Button type="submit" className="text-white mt-4">
        Submit
      </Button>
    </form>
  );
}
