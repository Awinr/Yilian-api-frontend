import {
  getUserVOByIdUsingGET,
  updateMyUserUsingPOST,
  updateSecretKeyUsingPOST,
  userLoginUsingPOST,
} from '@/services/re-api-backend/userController';
import { useModel } from '@@/exports';
import {
  CommentOutlined,
  FieldTimeOutlined,
  LoadingOutlined,
  LockOutlined,
  PlusOutlined,
  UnlockOutlined,
  UserOutlined,
  VerifiedOutlined,
} from '@ant-design/icons';
import { ModalForm, PageContainer, ProForm, ProFormInstance, ProFormText } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  Divider,
  Modal,
  Row,
  Typography,
  Upload,
  UploadFile,
  UploadProps,
  message,
} from 'antd';
import { RcFile, UploadChangeParam } from 'antd/es/upload';
import React, { useEffect, useRef, useState } from 'react';

const { Paragraph } = Typography;

const avatarStyle: React.CSSProperties = {
  width: '100%',
  textAlign: 'center',
};
const buttonStyle: React.CSSProperties = {
  marginLeft: '30px',
};

/**
 * 上传前校验
 * @param file 文件
 */
const beforeUpload = (file: RcFile) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('仅允许上传 JPG/PNG 格式的文件!');
  }
  const isLt2M = file.size / 1024 / 1024 < 5;
  if (!isLt2M) {
    message.error('文件最大上传大小为 5MB!');
  }
  return isJpgOrPng && isLt2M;
};

const Profile: React.FC = () => {
  const [data, setData] = useState<API.UserVO>({});
  const [visible, setVisible] = useState<boolean>(false);
  const [flag, setFlag] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const { initialState, setInitialState } = useModel('@@initialState');
  //使用formRef监控密码的输入
  const formRef = useRef<
    ProFormInstance<{
      userPassword: string;
    }>
  >();

  const UploadFileRequest = {
    biz: 'user_avatar',
    useId: initialState?.loginUser?.id,
  };

  useEffect(() => {
    try {
      getUserInfo(initialState?.loginUser?.id);
    } catch (e: any) {
      console.log(e);
    }
  }, []);

  // 获取用户信息，更新全局状态
  const getUserInfo = async (id: any) => {
    return getUserVOByIdUsingGET({ id }).then((res: any) => {
      if (res.data) {
        setInitialState((s: any) => ({ ...s, loginUser: res.data }));
        setData(res.data);
        setImageUrl(res.data.userAvatar);
      }
    });
  };

  // 显示秘钥
  const showSecretKey = async () => {
    try {
      let userPassword = formRef?.current?.getFieldValue('userPassword');

      // 登录
      const res = await userLoginUsingPOST({
        userAccount: data?.userAccount || '',
        userPassword: userPassword || '',
      });
      setOpen(false);
      setVisible(true);
      formRef?.current?.resetFields();
      return true;
    } catch (error: any) {
      message.error('显示失败，' + error.message);
      return false;
    }
  };

  // 更新用户信息
  const updateUserProfile = async (values:API.UserUpdateMyRequest) => {
    // 更新用户
    const hide = message.loading('正在更新');
    try {
      const res = await updateMyUserUsingPOST({
        ...values,
      });
      hide();
      message.success('更新成功');
      // 同步到前端全局状态
      getUserInfo(data?.id);
      return true;
    } catch (error: any) {
      hide();
      message.error('更新失败，' + error.message);
      return false;
    }
  };

  /**
   * todo 上传图片
   * @param info
   */
  const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      console.log('UploadFileRequest:', UploadFileRequest);
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // const res = await uploadFileUsingPOST({
      //     file: info.file.originFileObj as any
      // })
      if (info.file.response.code === 0) {
        message.success(`上传成功`);
        const id = initialState?.loginUser?.id as number;
        // 设置新头像的url
        const userAvatar = info.file.response.data;
        setLoading(false);
        setImageUrl(userAvatar);
        // 同步到前端全局状态
        getUserInfo(id);
      }
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  // 重置秘钥
  const resetSecretKey = async () => {
    try {
      let userPassword = formRef?.current?.getFieldValue('userPassword');
      // 登录
      const res = await userLoginUsingPOST({
        userAccount: data?.userAccount,
        userPassword: userPassword,
      });
      if (res.code === 0) {
        const res = await updateSecretKeyUsingPOST({
          id: data?.id,
        });
        if (res.data) {
          getUserInfo(data?.id);
          message.success('重置成功！');
          setOpen(false);
        }
      }
    } catch (error: any) {
      message.error('更新失败，' + error.message);
      console.log(error);
    }
  };
  const URL = process.env.NODE_ENV==='production'?'http://122.51.215.230:8101':'http://localhost:8101';
  return (
    <PageContainer>
      <Row gutter={24}>
        <Col span={8}>
          <Card title="个人信息" bordered={false}>
            <Row>
              <Col style={avatarStyle}>
                <Upload
                  name="file"
                  listType="picture-circle"
                  showUploadList={false}
                  // 后端处理文件请求的接口，上线需要修改
                  action= {URL+"/admin/api/file/upload"}
                  // 不要写data={{UploadFileRequest}}，这意味着有很多个参数
                  // 而我们选择把参数全封入UploadFileRequest里了
                  data={UploadFileRequest}
                  method='POST'
                  headers={{
                    // 下面这个和src/app.tsx保持一致即可
                    Authorization:'Bearer '+localStorage.getItem('token')||''
                  }}
                  beforeUpload={beforeUpload}
                  onChange={handleChange}
                >
                  {imageUrl ? (
                    <img
                      src={data?.userAvatar}
                      alt="avatar"
                      style={{ width: '100%', borderRadius: '10px' }}
                    />
                  ) : (
                    uploadButton
                  )}
                </Upload>
              </Col>
            </Row>
            <Divider />
            <Row>
              <Col>
                <UserOutlined /> 用户名称：{data?.userName}
              </Col>
            </Row>
            <Divider />
            <Row>
              <Col>
                <CommentOutlined /> 用户账号：{data?.userAccount}
              </Col>
            </Row>
            <Divider />
            <Row>
              <Col>
                <VerifiedOutlined /> 用户角色：{data?.userRole}
              </Col>
            </Row>
            <Divider />
            <Row>
              <Col>
                <VerifiedOutlined /> 用户介绍：{data?.userProfile}
              </Col>
            </Row>
            <Divider />
            <Row>
              <Col>
                <FieldTimeOutlined /> 注册时间：{data?.createTime}
              </Col>
            </Row>
            <Divider />

            <ModalForm 
              title="修改资料中"
              trigger={<Button style={{
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'block',
            }} type="primary">修改资料</Button>}
              submitter={{
                searchConfig: {
                  submitText: '确认',
                  resetText: '取消',
                },
              }}
              onFinish={async (values) => {
                console.log(values);
                updateUserProfile(values);
                //message.success('提交成功');
                return true;
              }}
            >
              <ProFormText
                width="md"
                name="userName"
                label="用户名称"
                tooltip="最长为 24 位"
                placeholder="请输入名称"
              />

              <ProFormText
                width="md"
                name="userProfile"
                label="用户自我介绍"
                placeholder="请输入自我介绍"
              />
            </ModalForm>

          </Card>
        </Col>
        <Col span={16}>
          <Card title="秘钥操作" bordered={false}>
            <Row>
              <Col>
                {visible ? (
                  <Paragraph
                    copyable={{
                      text: data?.accessKey,
                    }}
                  >
                    <LockOutlined /> accessKey：{data?.accessKey}
                  </Paragraph>
                ) : (
                  <Paragraph>
                    <UnlockOutlined /> accessKey：*********
                  </Paragraph>
                )}
              </Col>
            </Row>
            <Divider />
            <Row>
              <Col>
                {visible ? (
                  <Paragraph
                    copyable={{
                      text: data?.secretKey,
                    }}
                  >
                    <UnlockOutlined /> secretKey：{data?.secretKey}
                  </Paragraph>
                ) : (
                  <Paragraph>
                    <UnlockOutlined /> secretKey：*********
                  </Paragraph>
                )}
              </Col>
            </Row>
            <Divider />
            <Row>
              <Col>
                {!visible ? (
                  <Button
                    type="primary"
                    onClick={() => {
                      setOpen(true);
                      setFlag(true);
                    }}
                  >
                    查看秘钥
                  </Button>
                ) : (
                  <Button type="primary" onClick={() => setVisible(false)}>
                    隐藏秘钥
                  </Button>
                )}
                <Button
                  style={buttonStyle}
                  onClick={() => {
                    setOpen(true);
                    setFlag(false);
                  }}
                  type="primary"
                  danger
                >
                  重置秘钥
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Modal
        title="重置密钥"
        open={open}
        onOk={flag ? showSecretKey : resetSecretKey}
        onCancel={() => setOpen(false)}
      >
        <ProForm<{
          userPassword: string;
        }>
          formRef={formRef}
          formKey="check-user-password-form"
          autoFocusFirstInput
          //取消和确定
          submitter={{
            resetButtonProps: {
              style: {
                display: 'none',
              },
            },
            submitButtonProps: {
              style: {
                display: 'none',
              },
            },
          }}
        >
          <ProFormText.Password name="userPassword" placeholder="请输入用户密码" />
        </ProForm>
      </Modal>
    </PageContainer>
  );
};

export default Profile;
