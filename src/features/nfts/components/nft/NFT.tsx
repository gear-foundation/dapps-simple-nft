import { HexString } from '@polkadot/util/types';
import { useAccount } from '@gear-js/react-hooks';
import { createSearchParams, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChangeEvent, useEffect, useState } from 'react';
import { Button, Container } from 'components';
import { useNodeAddress } from 'features/node-switch';
import { ReactComponent as SearchSVG } from '../../assets/search.svg';
import { ReactComponent as BackArrowSVG } from '../../assets/back-arrow.svg';
import { useNFTs } from '../../hooks';
import styles from './NFT.module.scss';

type Params = {
  programId: HexString;
  id: string;
};

function NFT() {
  const { programId, id } = useParams() as Params;
  const { account } = useAccount();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { getIpfsAddress, getImageUrl } = useNodeAddress();
  const { nfts } = useNFTs();
  const nft = nfts.find((item) => item.programId === programId && item.id === id);
  const { name, collection, description, owner, attribUrl } = nft || {};
  const [details, setDetails] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!attribUrl) return;

    const isIPFSHash = !Array.isArray(attribUrl);

    if (isIPFSHash) {
      const url = getIpfsAddress(attribUrl);

      fetch(url)
        .then((response) => response.json())
        .then((result) => setDetails(result));
    } else {
      setDetails(attribUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attribUrl]);

  useEffect(() => {
    setSearchQuery('');
  }, [pathname]);

  const getDetails = () =>
    details
      .filter((detail) => {
        const lowerCaseDetail = detail.toLocaleLowerCase();
        const lowerCaseQuery = searchQuery.toLocaleLowerCase();

        return lowerCaseDetail.includes(lowerCaseQuery);
      })
      .map((detail) => (
        <li key={detail} className={styles.detail}>
          <p>{detail}</p>
        </li>
      ));

  const handleSearchInputChange = ({ target }: ChangeEvent<HTMLInputElement>) => setSearchQuery(target.value);

  const handleOwnerButtonClick = () =>
    navigate({ pathname: '/list', search: createSearchParams({ query: owner || '' }).toString() });

  const handleBackButtonClick = () => navigate(-1);

  return (
    <section className={styles.nft}>
      <Container>
        {nft ? (
          <div className={styles.nft__container}>
            <div className={styles.nft__image}>
              <div className={styles.image}>
                <div className={styles.image__container}>
                  <img src={getImageUrl(nft.mediaUrl)} alt={nft.name} loading="lazy" />
                </div>
              </div>

              <div className={styles.footerWrapper}>
                <div className={styles.footer}>
                  <p className={styles.owner}>
                    <span className={styles.ownerHeading}>Owner:</span>
                    <span className={styles.ownerText}>{owner}</span>
                  </p>

                  <button type="button" className={styles.ownerButton} onClick={handleOwnerButtonClick}>
                    View NFTs
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.nft__info}>
              <h2 className={styles.name}>{name}</h2>
              {collection && <p className={styles.collection}>{collection}</p>}
              {description && <p className={styles.description}>{description}</p>}

              {attribUrl && (
                <div>
                  <div className={styles.header}>
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <label htmlFor="search" className={styles.label}>
                      NFT Details:
                    </label>

                    <div className={styles.inputWrapper}>
                      <SearchSVG />
                      <input
                        type="text"
                        placeholder="Search"
                        id="search"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                      />
                    </div>
                  </div>

                  <ul className={styles.details}>{getDetails()}</ul>
                </div>
              )}

              <div className={styles.buttons}>
                <Button variant="outline" className={styles.backButton} onClick={handleBackButtonClick}>
                  <BackArrowSVG />
                  <span>Back</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p>
            NFT with id {id} in {programId} contract not found.
          </p>
        )}
      </Container>
    </section>
  );
}

export { NFT };
