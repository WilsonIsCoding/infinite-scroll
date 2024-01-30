import { useCallback, useMemo, useRef } from "react";
import { useInfiniteQuery } from "react-query";

const MAX_POST_PAGE = 10;

interface TodoType {
  id: number;
  title: string;
}

const fetchTodos = async ({ pageParam }: { pageParam: number }) => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/todos?_pages=${pageParam}&_limit=${MAX_POST_PAGE}`
  );
  const todos = (await response.json()) as TodoType[];
  return todos;
};

export const Todo = () => {
  const { data, error, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useInfiniteQuery({
      queryKey: ["todos"],
      queryFn: ({ pageParam = 1 }) => fetchTodos({ pageParam }),
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length ? allPages.length + 1 : undefined;
      },
    });
  const observer = useRef<IntersectionObserver>();
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;

      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetching) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [fetchNextPage, hasNextPage, isFetching, isLoading]
  );

  const todos = useMemo(() => {
    return data?.pages.reduce((acc, page) => {
      return [...acc, ...page];
    }, []);
  }, [data]);

  if (isLoading) return <h1>Carregando mais dados...</h1>;

  if (error) return <h1>Erro ao carregar os dados</h1>;

  return (
    <div>
      {todos &&
        todos.map((item) => (
          <div key={item.id} ref={lastElementRef}>
            <p>{item.title}</p>
            <p>{item.id}</p>
          </div>
        ))}

      {isFetching && <div>Carregando mais dados...</div>}
    </div>
  );
};
