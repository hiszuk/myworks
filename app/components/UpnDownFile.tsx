/**
 * ファイルアップロード・ダウンロード用ボタン
 * ユーザーIDとファイルパスを指定して
 * ファイルをアップロードまたはダウンロードする
 */

import React, { useRef } from 'react'
import { useLocation, useSubmit, Form } from '@remix-run/react'
import { ImageUp, Trash } from 'lucide-react'
import { Button } from './ui/button'
import { AppDialogProps, AppAlertDialog } from './AlertDialog'

/**
 * 引数の型
 */
type UploadFileProps = {
  userid: string
  path: string
}

/**
 * 指定ファイルをアップロードする
 * @param userid: ユーザーID
 * @param path: ファイルパス ex) userid/images/avatar
 * @returns アップロードボタンコンポーネント
 */
export const UploadFile = ({ userid, path }: UploadFileProps) => {
  const location = useLocation()

  // プログラム内からサブミットする
  const submit = useSubmit()

  // 隠しボタンの参照
  const inputRef = useRef<HTMLInputElement>(null)

  // 見えているボタンをクリックしたときのハンドラ
  const handleClick = () => {
    // 隠しボタン(input type="file")をクリックする
    inputRef.current?.click()
  }

  const handleSubmit = () => {
    if (inputRef.current?.files && inputRef.current?.files.length > 0) {
      const formData = new FormData()
      formData.append('path', path)
      formData.append('file', inputRef.current.files[0])
      submit(formData, {
        method: 'put',
        encType: 'multipart/form-data',
        action: `/auth/${userid}/upload`,
      })
    }
  }

  return (
    <Form key={location.key} preventScrollReset onChange={handleSubmit}>
      <input type="file" name="file" ref={inputRef} className="hidden" />
      <Button type="button" size="sm" className="text-sm" onClick={handleClick}>
        <ImageUp size={24} className="mr-2" />
        アップロード
      </Button>
      <p className="mt-1 text-xs text-muted-foreground">画像をアップロードします</p>
    </Form>
  )
}

/**
 * 指定ファイルを削除する
 * @param userid: ユーザーID
 * @param path: ファイルパス ex) userid/images/avatar
 * @returns 削除ボタンコンポーネント
 */
export const DeleteFile = ({ userid, path }: UploadFileProps) => {
  const submit = useSubmit()

  const [modalConfig, setModalConfig] = React.useState<AppDialogProps | undefined>()
  const handleDelete = async () => {
    const ret = await new Promise<string>((resolve) => {
      setModalConfig({
        onClose: resolve,
        title: 'イメージを削除します',
        message: '削除すると元には戻せません。このまま削除を実行しますか?',
        variant: 'warning',
        okLabel: '削除する',
        cancelLabel: 'やめる',
      })
    })
    setModalConfig(undefined)
    if (ret === 'ok') {
      const formData = new FormData()
      formData.append('path', path)
      submit(formData, {
        method: 'delete',
        encType: 'application/x-www-form-urlencoded',
        action: `/auth/${userid}/upload`,
      })
    }
    if (ret === 'cancel') {
      // console.log('CANCELが押された');
    }
  }
  return (
    <div className="flex flex-col justify-end">
      <Button variant="destructive" size="sm" className="text-sm" onClick={handleDelete}>
        <Trash size={20} className="mr-1" />
        イメージ削除
      </Button>
      <p className="mt-1 text-xs text-muted-foreground text-right">画像を削除します</p>
      {modalConfig && <AppAlertDialog {...modalConfig} />}
    </div>
  )
}
