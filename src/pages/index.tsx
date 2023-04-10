import { MouseEvent, MouseEventHandler, useEffect, useState } from 'react'
import Head from 'next/head'
import Header from '@component/components/Header'
import Button from '@component/components/Button'
import Select from '@component/components/Select'
import styles from '@component/styles/Home.module.css'
import Grid from '@component/components/News/Grid'
import { getNewsByQueryAndPage } from '@component/services/news'
import { getFavorites, setFavorites } from '@component/services/favorites'
import { News } from '@component/types/news'
import { SELECT_OPTIONS } from '@component/constants'
import { debounce } from '@component/utils/intes'
import Loader from '@component/components/Loader'

export default function Home() {
  const [showFavs, setShowFavs] = useState(false)
  const [favs, setFavs] = useState(getFavorites())
  const [items, setItems] = useState<Array<News>>([])
  const [page, setPage] = useState(0)
  const [lastPage, setLastPage] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getParams()
  }, [page])

  const getParams = debounce(async () => {
    if (lastPage) return

    try {
      setIsLoading(true)
      const { hits, pagination } = await getNewsByQueryAndPage(page.toString())

      if (pagination.totalPages === page) setLastPage(true)
      setItems((prev) => [...prev, ...hits])
    } catch (err) {
      window.alert(err)
    } finally {
      setIsLoading(false)
    }
  })

  const handleChange = (value: string) => {
    localStorage.setItem('query', value)
    if (page === 0) getParams()
    setPage(0)
    setItems([])
    setLastPage(false)
  }

  const handleFav: MouseEventHandler<Element> = (
    event: MouseEvent<HTMLInputElement>
  ) => {
    event.preventDefault()

    const { id } = event.target as HTMLElement
    const { newFavs, newItems } = setFavorites(id, favs, items)

    setFavs(newFavs)
    setItems(newItems)
  }

  const handleShowAll = () => setShowFavs(false)

  const handleShowFavs = () => setShowFavs(true)

  const getNextPage = () => setPage(page + 1)

  return (
    <>
      <Head>
        <title>Hacker News</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className={styles.main}>
        <div className={styles.buttonWrapper}>
          <Button label="All" onClick={handleShowAll} selected={!showFavs} />
          <Button
            label="My faves"
            onClick={handleShowFavs}
            selected={showFavs}
          />
        </div>

        {showFavs ? (
          <Grid items={favs} handleFav={handleFav} />
        ) : (
          <>
            <Select
              options={SELECT_OPTIONS}
              placeholder="Select your news"
              handleChange={handleChange}
            />
            <Grid
              items={items}
              handleFav={handleFav}
              getNextPage={getNextPage}
            />
          </>
        )}

        {isLoading && (
          <div className={styles.loaderWrapper}>
            <Loader />
          </div>
        )}
      </main>
    </>
  )
}
