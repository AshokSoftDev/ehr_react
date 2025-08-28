import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { FormFloatingInput } from "@/components/form/form-floating-input";
import { FormFloatingSelect } from "@/components/form/form-floating-select";
import { FormSearchSelect } from "@/components/form/form-search-select";
import { Card } from "@/components/ui/card";

const schema = z.object({
  firstName: z
    .string()
    .min(1, "Required")
    .transform((s) => s.toUpperCase()),
  email: z
    .string()
    .email("Invalid email")
    .transform((s) => s.toUpperCase()),
  age: z.coerce.number().min(18, "Must be at least 18"),
  country: z.string().min(1, "Select a country"),
  city: z.string().min(1, "Select a city"),
});

type FormValues = z.infer<typeof schema>;

const countryOptions = [
  { label: "United States", value: "US" },
  { label: "Canada", value: "CA" },
  { label: "United Kingdom", value: "UK" },
];

const cityOptions = [
  { label: "New York", value: "NYC", keywords: ["usa", "us", "ny"] },
  { label: "Toronto", value: "TOR", keywords: ["ca", "canada"] },
  { label: "London", value: "LDN", keywords: ["uk", "england"] },
];

export default function DemoForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      email: "",
      age: 18,
      country: "",
      city: "",
    },
    mode: "onTouched",
  });

  const onSubmit = (values: FormValues) => {
    // Values will already be uppercase for inputs (and transformed by zod)
    console.log(values);
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormFloatingInput
            control={form.control}
            name="firstName"
            label="First name"
            type="text"
          />

          <FormFloatingInput
            control={form.control}
            name="email"
            label="Email"
            type="email"
          />

          <FormFloatingInput
            control={form.control}
            name="age"
            label="Age"
            type="number"
            inputMode="numeric"
          />

          <FormFloatingSelect
            control={form.control}
            name="country"
            label="Country"
            options={countryOptions}
            placeholder="Choose a country"
          />

          <FormSearchSelect
            control={form.control}
            name="city"
            label="City"
            options={cityOptions}
            placeholder="Search city..."
          />

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </Form>
    </Card>
  );
}
