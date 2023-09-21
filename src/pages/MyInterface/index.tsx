import {
  ListMyInterfaceInfoVOByPageUsingPOST,
  ListOwnInterfaceInfoVOByPageUsingPOST,
} from '@/services/re-api-backend/interfaceInfoController';
import { FrownOutlined, SmileOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import {
  Button,
  Card,
  Layout,
  List,
  Pagination,
  PaginationProps,
  Space,
  Tooltip,
  message,
} from 'antd';
import Search from 'antd/es/input/Search';
import { Content, Footer, Header } from 'antd/es/layout/layout';
import React, { useEffect, useState } from 'react';
import indexStyle from './index.less';
const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  height: '60px',
  paddingInline: ' 2em',
  lineHeight: '150%',
  color: '#fff',
  background: 'none',
};
const footerStyle: React.CSSProperties = {
  textAlign: 'center',
};

const contentStyle: React.CSSProperties = {
  minHeight: 120,
  lineHeight: '120px',
};

const Index: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [total, setTotal] = useState<number>(0);
  const [current, setCurrent] = useState<number>(1);
  const [list, setList] = useState<API.InterfaceInfoVO[]>([]);
  // flag0是查看我开通的接口，1是查看我创建的接口
  const [flag, setFlag] = useState(0);

  const loadData = async (searchText = '', current = 1, pageSize = 6) => {
    setLoading(true);
    try {
      if (flag == 0) {
        //列举用户开通的接口
        await ListMyInterfaceInfoVOByPageUsingPOST({
          name: searchText,
          current,
          pageSize,
        }).then((res) => {
          console.log(res.data);
          setTotal(res?.data?.total ?? 0);
          setList(res?.data?.records ?? []);
        });
      } else if (flag == 1) {
        // 列举用户创建的接口
        await ListOwnInterfaceInfoVOByPageUsingPOST({
          current,
          pageSize,
        }).then((res) => {
          console.log(res.data);
          setTotal(res?.data?.total ?? 0);
          setList(res?.data?.records ?? []);
        });
      }
    } catch (error: any) {
      message.error('请求失败，' + error.message);
    }
    setLoading(false);
  };
  useEffect(() => {
    loadData();
  }, [flag]);

  const onSearch = (value: string) => {
    console.log('搜索ing');
    setSearchText(value);
    loadData(value);
  };

  const onChange: PaginationProps['onChange'] = (pageNumber) => {
    console.log(pageNumber);
    console.log('页数变化');
    setCurrent(pageNumber);
    loadData(searchText, pageNumber);
  };

  const onSizeChange = (current: number, size: number) => {
    console.log('页面大小变化ing');
    loadData(searchText, current, size);
  };
  const handleOnclick = () => {
    // 点击按钮修改flag状态
    // 为什么初始化之后第一次点击无效
    setFlag(flag === 0 ? 1 : 0);
  };

  const CardInfo: React.FC<{
    totalNum: React.ReactNode;
    leftNum: React.ReactNode;
  }> = ({ totalNum, leftNum }) => (
    <div className={indexStyle.cardInfo}>
      <div>
        <p>已调用次数</p>
        <p>{totalNum}</p>
      </div>
      <div>
        <p>剩余调用次数</p>
        <p>{leftNum}</p>
      </div>
    </div>
  );

  return (
    <PageContainer>
      <Layout>
        <Header style={headerStyle}>
          <Space>
            <Search
              size={'large'}
              placeholder="请输入接口名称"
              onSearch={onSearch}
              enterButton
              style={{ width: '100%' }}
            />
            <div>
              {flag === 0 ? (
                <Button type="primary" shape="round" onClick={handleOnclick}>
                  查看我创建的接口
                </Button>
              ) : null}
              {flag === 1 ? (
                <Button type="primary" shape="round" onClick={handleOnclick}>
                  查看我开通的接口
                </Button>
              ) : null}
            </div>
          </Space>
        </Header>
        <Content style={contentStyle}>
          <List<API.InterfaceInfoVO>
            className={indexStyle.filterCardList}
            grid={{ gutter: 24, xxl: 3, xl: 2, lg: 2, md: 2, sm: 2, xs: 1 }}
            dataSource={list || []}
            loading={loading}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  bodyStyle={{ paddingBottom: 20 }}
                  actions={[
                    item.status === 1
                      ? [
                          <Tooltip title="在线调用" key="share">
                            <div
                              onClick={() => {
                                history.push('/interface_info/' + item.id);
                              }}
                            >
                              在线调用
                            </div>
                          </Tooltip>,
                        ]
                      : [
                          <Tooltip title="接口已关闭" key="share">
                            <FrownOutlined />
                          </Tooltip>,
                        ],

                    // 是否是当前用户所拥有
                    item.isOwnerByCurrentUser === true
                      ? [
                          <Tooltip title="已创建该接口" key="share">
                            <div
                              onClick={() => {
                                history.push('/admin/interface_info');
                              }}
                            >
                              管理接口
                            </div>
                          </Tooltip>,
                        ]
                      : [
                          <Tooltip title="已开通该接口" key="share">
                            <SmileOutlined />
                          </Tooltip>,
                        ],
                  ]}
                >
                  <Card.Meta title={item.name} />
                  <div>
                    <CardInfo totalNum={item.totalNum} leftNum={item.leftNum} />
                  </div>
                </Card>
              </List.Item>
            )}
          />
          <Footer style={footerStyle}>
            <Pagination
              showQuickJumper
              showSizeChanger
              pageSizeOptions={[6, 10, 20, 30]}
              current={current}
              onShowSizeChange={onSizeChange}
              defaultPageSize={6}
              total={total}
              onChange={onChange}
            />
          </Footer>
        </Content>
      </Layout>
    </PageContainer>
  );
};

export default Index;
