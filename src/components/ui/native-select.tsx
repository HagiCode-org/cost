import * as React from "react"

import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "lucide-react"

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default" | "lg"
}

function NativeSelect({
  className,
  size = "default",
  ...props
}: NativeSelectProps) {
  return (
    <div
      className={cn(
        "group/native-select relative w-fit has-[select:disabled]:opacity-50",
        className
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className="border-input bg-background text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 h-10 w-full min-w-0 appearance-none rounded-full border py-2 pr-10 pl-4 text-[0.94rem] transition-[border-color,box-shadow,background-color] select-none focus-visible:ring-[3px] data-[size=sm]:h-8 data-[size=sm]:px-3.5 data-[size=sm]:text-[0.82rem] data-[size=lg]:h-14 data-[size=lg]:pr-12 data-[size=lg]:pl-5 data-[size=lg]:text-base outline-none disabled:pointer-events-none disabled:cursor-not-allowed"
        {...props}
      />
      <ChevronDownIcon className="text-muted-foreground pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 select-none group-data-[size=lg]/native-select:right-5 group-data-[size=lg]/native-select:size-5" aria-hidden="true" data-slot="native-select-icon" />
    </div>
  )
}

function NativeSelectOption({ ...props }: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" {...props} />
}

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn(className)}
      {...props}
    />
  )
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
