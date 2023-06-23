import { useForm } from '@mantine/form';
import { useNavigate, createSearchParams, useLocation } from 'react-router-dom';
import { Button } from '@gear-js/ui';
import { useEffect } from 'react';
import { ReactComponent as SearchSVG } from '../../assets/search.svg';
import { ReactComponent as ResetSVG } from '../../assets/reset.svg';
import { useNFTSearch } from '../../hooks';
import styles from './Search.module.scss';

function Search() {
  const { searchQuery, resetSearchQuery } = useNFTSearch();
  const { getInputProps, onSubmit, reset, setFieldValue } = useForm({ initialValues: { query: '' } });

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleSubmit = onSubmit(({ query }) => {
    navigate({ pathname: '/list', search: createSearchParams({ query }).toString() });
  });

  const handleResetButtonClick = () => {
    reset();
    resetSearchQuery();
  };

  useEffect(() => {
    setFieldValue('query', searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <form className={styles.inputWrapper} onSubmit={handleSubmit}>
      <SearchSVG />
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <input type="text" placeholder="Search NFTs and accounts" id="search" {...getInputProps('query')} />

      {searchQuery && <Button icon={ResetSVG} color="transparent" onClick={handleResetButtonClick} />}
    </form>
  );
}

export { Search };
