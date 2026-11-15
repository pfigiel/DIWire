type Props = {
  href: string
  width: number
  height: number
  rotationDeg: number
}

/** The plan in sheet space: centred on the origin and turned about it. */
export const PlanImage = ({ href, width, height, rotationDeg }: Props) => (
  <image
    href={href}
    x={-width / 2}
    y={-height / 2}
    width={width}
    height={height}
    preserveAspectRatio="none"
    transform={`rotate(${rotationDeg})`}
  />
)
