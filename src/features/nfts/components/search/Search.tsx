import { useForm } from '@mantine/form';
import { useNavigate, createSearchParams } from 'react-router-dom';
import { Button } from '@gear-js/ui';
import { ReactComponent as SearchSVG } from '../../assets/search.svg';
import { ReactComponent as ResetSVG } from '../../assets/reset.svg';
import { useNFTSearch } from '../../hooks';
import styles from './Search.module.scss';

function Search() {
  const { searchQuery, resetSearchQuery } = useNFTSearch();

  const { getInputProps, onSubmit, reset } = useForm({ initialValues: { query: searchQuery } });
  const navigate = useNavigate();

  const handleSubmit = onSubmit(({ query }) => {
    navigate({ pathname: '/list', search: createSearchParams({ query }).toString() });
  });

  const handleResetButtonClick = () => {
    reset();
    resetSearchQuery();
  };

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
