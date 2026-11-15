import { Dropzone as MantineDropzone } from '@mantine/dropzone'
import { IconUpload } from '@tabler/icons-react'
import classes from './Dropzone.module.css'

export type Props = {
  title: string
  hint: string
  action: string
  /** MIME types. */
  accept: string[]
  onDrop: (file: File) => void
}

export const Dropzone = ({ title, hint, action, accept, onDrop }: Props) => {
  const dropFirst = ([file]: File[]) => {
    if (file !== undefined) {
      onDrop(file)
    }
  }

  return (
    <MantineDropzone
      multiple={false}
      accept={accept}
      classNames={{ root: classes.root, inner: classes.inner }}
      onDrop={dropFirst}
    >
      <span className={classes.mark}>
        <IconUpload aria-hidden className={classes.icon} />
      </span>
      <span className={classes.title}>{title}</span>
      <span className={classes.hint}>{hint}</span>
      <span className={classes.action}>{action}</span>
    </MantineDropzone>
  )
}
