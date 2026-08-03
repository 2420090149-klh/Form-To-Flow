import React from "react"

export function SiteFooter() {
  return (
    <footer className="border-t bg-white dark:bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0 px-4">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-8 md:px-0 w-full justify-between">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            <strong>Form-To-Flow</strong> &mdash; Streamlining event management, registration, and seamless attendee check-ins.
          </p>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-right">
            Created by{" "}
            <a
              href="https://www.linkedin.com/in/k-dheeran-37684a315"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4 hover:text-primary transition-colors"
            >
              K DHEERAN
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  )
}
