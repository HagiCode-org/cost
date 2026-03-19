import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useTranslation } from "react-i18next"

interface FormBlueprintSectionProps {
  title: string
  description: string
  helper: string
  button: string
  foundationStatus: string
  labels: {
    role: string
    industry: string
    context: string
  }
  placeholders: {
    role: string
    industry: string
    context: string
  }
}

export function FormBlueprintSection(props: FormBlueprintSectionProps) {
  const { t } = useTranslation()

  return (
    <section id="blueprint" aria-labelledby="blueprint-title" className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Card className="glass-panel surface-outline overflow-hidden rounded-[2rem]">
          <CardHeader className="gap-4 border-b border-border/70 bg-background/60 px-6 py-6 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Badge variant="secondary" className="mb-3 rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary">
                  {t("formBlueprint.badge")}
                </Badge>
                <CardTitle id="blueprint-title" className="display-type text-4xl font-semibold sm:text-5xl">
                  {props.title}
                </CardTitle>
              </div>
              <Badge className="rounded-full px-3 py-1.5 text-xs">{props.foundationStatus}</Badge>
            </div>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">{props.description}</p>
          </CardHeader>
          <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldContent>
                      <FieldLabel htmlFor="role-prototype">{props.labels.role}</FieldLabel>
                      <Input id="role-prototype" disabled placeholder={props.placeholders.role} />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldContent>
                      <FieldLabel htmlFor="industry-prototype">{props.labels.industry}</FieldLabel>
                      <Input id="industry-prototype" disabled placeholder={props.placeholders.industry} />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldContent>
                      <FieldLabel htmlFor="context-prototype">{props.labels.context}</FieldLabel>
                      <Textarea id="context-prototype" disabled placeholder={props.placeholders.context} className="min-h-28" />
                      <FieldDescription>{props.helper}</FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </FieldSet>
              <Button type="button" disabled size="lg" className="rounded-full px-5">
                {props.button}
              </Button>
            </div>
            <div className="rounded-[1.75rem] border border-dashed border-primary/45 bg-primary/8 p-5 text-sm leading-7 text-muted-foreground">
              <p className="mb-3 font-semibold text-foreground">{t("formBlueprint.contractTitle")}</p>
              <p>{t("formBlueprint.contractDescription")}</p>
              <p className="mt-3">{t("formBlueprint.contractNote")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
